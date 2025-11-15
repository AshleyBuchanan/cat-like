const fs = require('fs');
const axios = require('axios');
const open = (...args) => import('open').then(mod => mod.default(...args));         // the open package is ESM-only... I could've just converted to ESM but I'd already struggled to find this.:D

function output(content, outPath) {
    if (outPath) {
        try {
            fs.writeFileSync(outPath, content, 'utf8');
        } catch (err) {
            console.error(`Couldn't write ${outPath}: ${err.message}`);
            process.exit(1)
        }
    } else {
        console.log(content);
    }
}

function cat(path, outPath) {
    try {
        const data = fs.readFileSync(path, 'utf8');
        console.log(data, outPath);
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

async function webCat(src, dest) {
    let payload;

    try {
        payload = await axios.get(src);
    } catch (err) {
        console.error(`Error fetching ${src}:`, err);
        process.exit(1);
    }

    switch(dest) {
        case 'console':
            console.log(payload.data);
            break;
        
        case 'browser':
            await open(src);
            console.log(`${src} passed to default browser.`);
            break;

        default:
            //write to file
            break;
    }
}

async function main() {
    const args = process.argv.slice(2);
    console.log(args, args.length);

    //if no args[]:
    if (args.length === 0) {
        console.error('Please provide a file path or web address.');
        console.log('\nExample Usage:');
        console.log(' node step3.js [--out] <file path or web address> <file destination, [browser], or [console]>\n\n');
        process.exit(1);
    };


    //if --out and destination specified:
    if (args[0] === '--out' && args[2]) {
        webCat(args[1], args[2]);
    
    //if --out and no destination specified:
    } else if (args[0] === '--out') {
        webCat(args[1], 'console'); 

    //if no--out and destination specified:
    } else if (args[0] !== '--out' && args[1]) {
        webCat(args[0], args[1]);

    //if no--out and no destination specified:
    } else if (args[0] !== '--out') {
        webCat(args[0], 'console');
    };



    
    

    
    






    // if (args[2].startsWith('http://') || args[2].startsWith('https://')) {
    //     if (await validated(args)) {
    //         await webCat(args);
    //     }
    // } else {
    //     cat(args);
    // }
}

main();

// i wanted to provide a quick check before opening the url, so I duct-taped both axios and open to accomplish this.