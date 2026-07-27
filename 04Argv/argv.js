// console.log(process.argv);
// const env = process.argv[2];
// console.log(`Environment: ${env}`);

// console.log('filename : ',__filename);
// console.log('dirname : ',__dirname);
// console.log('cwd : ',process.cwd());
// console.log('are they equal? : ',__dirname === process.cwd());

console.log("__filename:", __filename);
console.log("__dirname:", __dirname);
console.log("cwd:", process.cwd());

console.log(__dirname === process.cwd());
console.log(__filename === process.cwd());