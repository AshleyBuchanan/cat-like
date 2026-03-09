const fs = require('fs');
const axios = require('axios');
const open = (...args) => import('open').then(mod => mod.default(...args));         // the open package is ESM-only... I could've just converted to ESM but I'd already struggled to find this.:D

function outputToFile(content, dest) {
    if (dest) {
        try {
            fs.writeFileSync(dest, content, 'utf8');
        } catch (err) {
            console.error(`Couldn't write ${dest}: ${err.message}`);
            process.exit(1)
        }
    } else {
        console.log(content);
    }
}

function cat(src, dest) {
    try {
        const data = fs.readFileSync(src, 'utf8');

        switch(dest) {
            case 'console':
                console.log(data);
                break;
            
            case 'browser':
                open(src);
                break;

            default:
                outputToFile(data, dest);
        }
    } catch (err) {
        console.error(`Error reading ${src}:`, err.message);
        process.exit(1);
    }
}

// async function validated(url) {
//     try {
//         await axios.get(url);
//         return true;
//     } catch (err) {
//         if (err.code === 'ENOTFOUND') {
//             console.error(`404: url not found: ${url}`);
//         } else {
//             console.error(`Error fetching ${url}:`, err.message);
//         }
//         return false;
//     }
// }

async function webCat(src, dest) {
    let payload;

    try {
        payload = await axios.get(src, {
            //header was needed to access some sites like wikipedia
            headers: {
                'User-Agent': 'step3-cat/1.0 (learning project; contact: me@gmail.com)'
            }
        });
    } catch (err) {
        console.error(`Error fetching ${src}:`, err.code==='ENOTFOUND'?'404':err.response.status);
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
            outputToFile(payload.data, dest);
            console.log(`Contents written to ${dest}`);
            break;
    }
}

async function main() {
    console.log(process.argv)
    const args = process.argv.slice(2);
    console.log(args, args.length);

    //if no args[]:
    if (args.length === 0) {
        console.error('Please provide a file path or web address.');
        console.log('\nExample Usage:');
        console.log(' node step3.js [--out] <source file path or web address> <file destination, [browser], or [console]>\n\n');
        process.exit(1);
    };

    //these are separated intentionally for clarity (referencing the duplication)
    if (args[1].startsWith('http://') || args[1].startsWith('https://')) {
        //web
        //if --out and destination specified:
        if (args[0] === '--out' && args[2]) {
            await webCat(args[1], args[2]);
        
        //if --out and no destination specified:
        } else if (args[0] === '--out') {
            await webCat(args[1], 'console');   
        }
    } else {
        //file
        //if --out and destination specified:
        if (args[0] === '--out' && args[2]) {
            cat(args[1], args[2]);
        
        //if --out and no destination specified:
        } else if (args[0] === '--out') {
            cat(args[1], 'console');   
        }
    }
}

main();

// i wanted to provide a quick check before opening the url, so I duct-taped both axios and open to accomplish this.
// i also wanted to open files in the default browser.
// extract webpage -> write to file -> open file in browser -> rinse and repeat

