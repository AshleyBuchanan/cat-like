const fs = require('fs');

function cat(path) {
    try {
        const data = fs.readFileSync(path, 'utf8');
        console.log(data);
    } catch (err) {
        console.error(`Error reading ${path}:`, err.message);
        process.exit(1);
    }
}

// this seemed a good idea.
const arg = process.argv[2];
if (!arg) {
    console.error('Please provide a file path.');
    process.exit(1);
}

cat(arg);
