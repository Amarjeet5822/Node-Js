# What is process.cwd()?
### `CWD means : Current Working Directory, The directory from which the Node process was started.`

## `process.cwd() returns the current working directory from which the Node.js process was started. It is commonly used to build absolute paths for uploads, logs, configuration files, and project resources.`
```js
project/
├── server.js
├── uploads/
├── logs/
└── config/

Terminal : node server.js
console.log(process.cwd()) // /project

// __dirname  VS process.cwd()

// __dirname : Where this file is located.
// process.cwd(): Where was the application started from.

// __diranme : is tied to File Location.
// process.cwd() : is tied to : Where the application started.
```