const fs = require('fs');
const axios = require('axios');

function cat(path) {
    try {
        const data = fs.readFileSync(path, 'utf8');
        console.log(data);
    } catch (err) {
        console.error(`Error reading ${path}:`, err.message);
        process.exit(1);
    }
}

async function webCat(url) {
    try {
        const res = await axios.get(url);
        console.log(res.data);
    } catch (err) {
        if (err.code === 'ENOTFOUND') {
            console.error(`404: url not found: ${url}`);
            process.exit(404);
        } else {
            console.error(`Error fetching ${url}:`, err.message);
            process.exit(1);
        }
    }
}

const arg = process.argv[2];
if (!arg) {
    console.error('Please provide a file path.');
    process.exit(1);
}

if (arg.startsWith('http://') || arg.startsWith('https://')) {
    webCat(arg);
} else {
    cat(arg);
}
