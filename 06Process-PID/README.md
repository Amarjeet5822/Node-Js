# Topic 1: Process and PID in Node.js

## What is a Process?
### `An independent running instance of a program with its own memory, CPU allocation, file handles, network connections, and execution state.`
### `A process is a running instance of a program managed by the operating system. It has its own memory space, resources, file descriptors, network connections, and execution context.`

- `When we execute`
```js
node server.js 
```
#### Node.js doesn't directly run your code.
#### `The Operating System (Linux, Windows, macOS) creates a Process.`
server.js
↓
Node.js Runtime
↓
Operating System
↓
Process Created (PID)

## What Does a Process Contain?
```js
const users = []
 // Memory is Allocated

app.listen(3000)
// PORT is Opened

mysql.connect()
// Database connection is Opened.

// All of these belong to: 
Node Process

```
# What is PID?
## `PID (Process ID) is a unique identifier assigned by the operating system to every running process.`
### `PID = Process ID`
#### Every Process get a Unique number.
```js
Node Process
PID: 4521

MongoDB
PID: 7654

Nginx
PID: 1098
```
### The OS uses PID to identify processes.
