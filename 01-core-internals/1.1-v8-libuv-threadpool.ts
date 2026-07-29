import * as crypto from 'crypto';
import * as http from 'http';
import { IncomingMessage } from 'http';

/**
 * ============================================================================
 * Topic 1.1: Node.js Architecture & V8 / Libuv Threadpool Demonstration
 * ============================================================================
 * 
 * PURPOSE & CORE CONCEPTS:
 * ------------------------
 * 1. V8 Engine (Google C++):
 *    - Single-threaded execution of JS code on the V8 Call Stack.
 *    - Manages memory allocation in Heap and Garbage Collection (Scavenger / Mark-Sweep).
 * 
 * 2. Libuv C Library:
 *    - Event Loop: Coordinates async I/O events across 6 distinct execution phases.
 *    - Thread Pool: Offloads file operations (fs), crypto functions (pbkdf2/bcrypt),
 *      zlib compression, and dns.lookup away from the main thread.
 *    - Default pool size is 4 threads (configurable via process.env.UV_THREADPOOL_SIZE).
 * 
 * 3. Kernel-level Async I/O (epoll / kqueue / IOCP):
 *    - Network sockets (HTTP/HTTPS/TCP/UDP) bypass Libuv thread pool entirely.
 *    - OS kernel handles socket readiness natively and alerts Libuv via event demultiplexing.
 * 
 * INDUSTRY STANDARD USE CASE & PERFORMANCE IMPACT:
 * ------------------------------------------------
 * In high-concurrency microservices, running CPU-bound operations (e.g. crypto hashing)
 * on the default 4-thread pool causes thread starvation. Requests beyond the 4th worker
 * are queued in memory, leading to severe tail latency (p99) spikes.
 * 
 * HOW TO RUN THIS FILE:
 * ---------------------
 * $ npx tsx 01-core-internals/1.1-v8-libuv-threadpool.ts
 */

const start = Date.now();

/**
 * Utility function to print timestamp relative to script initialization.
 */
function logTime(taskName: string): void {
  const elapsed = Date.now() - start;
  console.log(`[${elapsed}ms] ${taskName}`);
}

/**
 * ----------------------------------------------------------------------------
 * 1. Threadpool Task: CPU-Intensive Crypto Operation
 * ----------------------------------------------------------------------------
 * PBKDF2 is heavy password hashing. Because JS is single-threaded, Node.js delegates
 * pbkdf2 to one of Libuv's worker threads in the thread pool.
 */
function runCryptoTask(id: number): void {
  crypto.pbkdf2('secret-password', 'salt-string', 100000, 8, 'sha256', (err, data) => {
    if (err) {
      console.error(`Crypto Task #${id} Error:`, err.message);
      return;
    }
    console.log('[hash-data ]: ', Buffer.isBuffer(data) ? data.toString('hex') : data);
    
    logTime(`Crypto Task #${id} Completed (Libuv Threadpool)`);
  });
}

/**
 * ----------------------------------------------------------------------------
 * 2. Kernel Async Task: OS-level Network Request
 * ----------------------------------------------------------------------------
 * HTTP requests use OS kernel event demultiplexing (epoll on Linux, kqueue on macOS).
 * They do NOT consume any threads from Libuv's thread pool.
 */
function runNetworkTask(id: number, port: number, onComplete: () => void): void {
  const req = http.get(`http://127.0.0.1:${port}`, (res: IncomingMessage) => {
    res.on('data', () => {});
    res.on('end', () => {
      logTime(`Network Task #${id} Completed (OS Kernel epoll/kqueue)`);
      onComplete();
    });
  });

  req.on('error', (err: Error) => {
    console.error(`Network Task #${id} Error:`, err.message);
    onComplete();
  });
}

// ----------------------------------------------------------------------------
// Execution Setup: Local HTTP Server & Benchmark Trigger
// ----------------------------------------------------------------------------

// Create lightweight HTTP server to demonstrate local network I/O
const server = http.createServer((_req, res) => {
  setTimeout(() => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  }, 100);
});

// Bind to random available local port
server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3000;

  console.log(`=== Node.js Architecture & Threadpool Demo ===`);
  console.log(`Default UV_THREADPOOL_SIZE: ${process.env.UV_THREADPOOL_SIZE || 4}`);
  console.log(`Starting 5 Crypto Tasks (Libuv Pool) and 2 Local Network Tasks (Kernel epoll)...\n`);

  let pendingNetwork = 2;
  const checkDone = () => {
    pendingNetwork--;
    if (pendingNetwork === 0) {
      server.close(); // Gracefully shutdown server once network requests finish
    }
  };

  // Trigger 5 Crypto Tasks concurrently.
  // Default threadpool size = 4. Tasks #1-#4 occupy all 4 threads.
  // Task #5 is forced to wait in Libuv's queue until a thread becomes available.
  runCryptoTask(1);
  runCryptoTask(2);
  runCryptoTask(3);
  runCryptoTask(4);
  runCryptoTask(5);

  // Trigger 2 Network Tasks concurrently.
  // Operating system kernel handles socket polling, completing without threadpool contention.
  runNetworkTask(1, port, checkDone);
  runNetworkTask(2, port, checkDone);
});
