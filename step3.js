const fs = require('fs');
const axios = require('axios');
const open = (...args) => import('open').then(mod => mod.default(...args));         // the open package is ESM-only... grrr

function cat(path) {
    try {
        const data = fs.readFileSync(path, 'utf8');
        console.log(data);
    } catch (err) {
        console.error(`Error reading ${path}:`, err.message);
        process.exit(1);
    }
}

async function validated(url) {
    try {
        await axios.get(url);
        return true;
    } catch (err) {
        if (err.code === 'ENOTFOUND') {
            console.error(`404: url not found: ${url}`);
        } else {
            console.error(`Error fetching ${url}:`, err.message);
        }
        return false;
    }
}

async function webCat(url) {
    try {
        await open(url);
    } catch (err) {
        console.error(`Error opening ${url}:`, err.message);
        process.exit(1);
    }
}

async function main() {
    const arg = process.argv[2];
    if (!arg) {
        console.error('Please provide a file path.');
        process.exit(1);
    }

    if (arg.startsWith('http://') || arg.startsWith('https://')) {
        if (await validated(arg)) {
            await webCat(arg);
        }
    } else {
        cat(arg);
    }
}

main();

// i wanted to provide a quick check before opening the url, so I duct taped both axios and open to accomplish this.