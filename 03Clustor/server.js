import cluster from "node:cluster";
import http from "node:http";
import { availableParallelism } from "node:os"
import process from "node:process";

const numsCPU = availableParallelism();
console.log("availableParallelism = ", numsCPU);

if( cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`)

    for( let i=0; i< numsCPU; i++ ) {
        cluster.fork()
    }
    // Fork workers
    cluster.on( "exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    // worker can share any TCP connection
    // In this case it is an HTTP server
    http.createServer( (req, res) => {
        res.writeHead(200);
        res.end(`Hello world\n`)
    }).listen(8000);
    
    console.log(`Worker ${ process.pid} started`);
}