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

async function cat(src, dest) {
    try {
        const data = fs.readFileSync(src, 'utf8');

        switch(dest) {
            case 'console':
                console.log(data);
                break;
            
            case 'browser':
                await open(src);
                break;

            default:
                outputToFile(data, dest);
        }
    } catch (err) {
        console.error(`Error reading ${src}:`, err.message);
        process.exit(1);
    }
}

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

async function director(args0, args1, args2) {
   //these are separated intentionally for clarity (referencing the duplication)
    if (args1.startsWith('http://') || args1.startsWith('https://')) {
        //web
        //if --out and destination specified:
        if (args0 === '--out' && args2) {
            await webCat(args1, args2);
        
        //if --out and no destination specified:
        } else if (args0 === '--out') {
            await webCat(args1, 'console');   
        }
    } else {
        //file
        //if --out and destination specified:
        if (args0 === '--out' && args2) {
            await cat(args1, args2);
        
        //if --out and no destination specified:
        } else if (args0 === '--out') {
            await cat(args1, 'console');   
        }
    };
};

async function main() {
    const args = process.argv.slice(2);
    console.log(args, args.length);

    //if no args[]:
    if (args.length === 0) {
        console.error('Please provide a file path or web address.');
        console.log('\nExample Usage:');
        console.log(' node step3.js [--out] <source file path or web address> <file destination, [browser], or [console]>\n\n');
        process.exit(1);
    //if many sets of args
    } else if (args.length >= 4) {
        for (let i = 1; i < args.length; i+=2) {
            await director(args[0], args[i], args[i+1]);
        };
    //if single set of args
    } else {
        await director(args[0], args[1], args[2]);
    }
    process.exit(0);
}

main();

// i wanted to provide a quick check before opening the url, so I duct-taped both axios and open to accomplish this.
// i also wanted to open files in the default browser.
// extract webpage -> write to file -> open file in browser -> rinse and repeat
// aarrrrgghh!


// this version requires two arguments per sequence of requests
// <source - destination> <source - destination> <source - destination> etc... 
