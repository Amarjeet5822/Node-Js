# What is ARGV?
## `process.argv is an array containing command-line arguments passed to the Node.js process. It is commonly used in scripts, CLI tools, migrations, seeders, automation tasks, and configuration handling.`
### `Argument Vector : It contains all the command-line argument passed to Node.`
```js
process.argv[2]

// In the terminal 
node migrate.js up : Run migration
// 
node migrate.js down : Rollback Migration
```