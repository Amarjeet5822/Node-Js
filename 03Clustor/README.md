# `What is Cluster?`
### `Cluster is a built-in Node.js module that allows you to create multiple Node.js processes (workers).`
## Each worker:
- Has its own memory
- Has its own event loop
- Can handle requests independently

                    Master Process
                           |
       ---------------------------------------
       |                |            |       |
    Worker 1       Worker 2     Worker 3  Worker 4
    ### Now all CPU cores can be utilized.

