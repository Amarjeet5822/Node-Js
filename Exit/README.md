# What is the process.exit()?
## `Stop this process and return control to the Operating System.`
### `process.exit() terminates the current Node.js process and returns an exit code to the operating system. It is commonly used in scripts, CLI tools, migrations, cron jobs, and automation tasks.`
```js
console.log("Start");

process.exit();

console.log("End");

// O/P : Start only , exit immediately terminate the process.

```
### Why do you think Node provides :
#### process.exit , when we can already stop an application using: ctrl + c.

#### `But Why Not Just Press Ctrl+C?`
```js
node migrate.js

// There is no human is sitting and watching it.
// The Script should decide itself:
// Migration Successfull
// Exit


```
## Use Case 1: Migration Script
```js
async function migrate() {
  await runMigration();

  console.log("Migration Complete");

  process.exit(0);
}

migrate();

// After migration finishes:
// Task Completed
// Process Exist 
// No need for Ctrl + C.
```
## `Use Case 2: Validation Script`
```js
if (!process.env.DB_URL) {
  console.log("DB_URL Missing");

  process.exit(1);
}
// Application stop itself, because required configuration is missing.

```
## process.exit(0): success message send to Operating System
## process.exit(1): failure message send to Operating system
