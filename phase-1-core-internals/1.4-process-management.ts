import * as http from 'http';

/**
 * ============================================================================
 * Topic 1.4: Global Objects, Process Management & Graceful Shutdown
 * ============================================================================
 * 
 * PURPOSE & CORE CONCEPTS:
 * ------------------------
 * 1. Global Object & Process Namespace:
 *    - `globalThis` / `global`: Node.js root execution context.
 *    - `process`: Global object providing information about, and control over,
 *       the current Node.js process.
 * 
 * 2. CLI Arguments & Environment Variables:
 *    - `process.argv`: Array containing command line arguments passed at invocation.
 *      argv[0] = node path, argv[1] = file path, argv[2..n] = user flags/args.
 *    - `process.env`: Key-value map of system environment variables.
 * 
 * 3. POSIX Signals & Process Lifecycle:
 *    - `SIGINT`: Interrupt signal (sent via Ctrl+C in terminal).
 *    - `SIGTERM`: Termination signal (sent by Kubernetes / Docker / PM2 during deployments).
 *    - `SIGKILL`: Hard kill signal (cannot be intercepted by Node.js).
 * 
 * 4. Enterprise Graceful Shutdown Pattern (MNC Standard):
 *    When a container/server receives SIGTERM/SIGINT:
 *    Step 1: Stop listening for new incoming HTTP/TCP connections (`server.close()`).
 *    Step 2: Complete active requests currently in flight.
 *    Step 3: Close database connection pools, Redis sockets, and message brokers.
 *    Step 4: Exit process cleanly with exit code 0 (`process.exit(0)`).
 *    Step 5: Enforce a fallback timeout (e.g. 10s) to forcefully exit if connections hang.
 * 
 * HOW TO RUN THIS FILE:
 * ---------------------
 * $ npx tsx 01-core-internals/1.4-process-management.ts --port=8080 --mode=production
 * OR
 * $ npm run demo:1.4
 */

// ----------------------------------------------------------------------------
// 1. CLI Arguments & System Inspection
// ----------------------------------------------------------------------------
console.log('=== Node.js Process & System Metrics ===');
console.log(`Process ID (PID): ${process.pid}`);
console.log(`Node.js Version: ${process.version}`);
console.log(`Platform / Arch: ${process.platform} / ${process.arch}`);

// Parse CLI flags from process.argv
const rawArgs = process.argv.slice(2);
const parsedArgs: Record<string, string> = {};

rawArgs.forEach((arg) => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.replace(/^--/, '').split('=');
    if (key) parsedArgs[key] = value || 'true';
  }
});

console.log(`\nParsed CLI Flags:`, parsedArgs);

// Inspect Process Memory Usage
const mem = process.memoryUsage();
console.log('\nProcess Memory Footprint:');
console.log(` - RSS (Resident Set Size): ${(mem.rss / 1024 / 1024).toFixed(2)} MB`);
console.log(` - Heap Total: ${(mem.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(` - Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`);

// ----------------------------------------------------------------------------
// 2. Simulated Database Pool (Mocking MongoDB / Redis Connection)
// ----------------------------------------------------------------------------
class DatabasePool {
  private isConnected = true;

  async disconnect(): Promise<void> {
    console.log('[Database] Closing active connection pool and flushing pending queries...');
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate pool drain delay
    this.isConnected = false;
    console.log('[Database] Connection pool closed successfully.');
  }
}

const dbPool = new DatabasePool();

// ----------------------------------------------------------------------------
// 3. HTTP Server Initialization
// ----------------------------------------------------------------------------
const PORT = Number(parsedArgs['port']) || 3000;
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'UP', pid: process.pid }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Handled by PID ${process.pid}`);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\nHTTP Server listening on http://127.0.0.1:${PORT}`);
  console.log(`[INFO] Send SIGINT (Ctrl+C) or SIGTERM to trigger Enterprise Graceful Shutdown.\n`);
});

// ----------------------------------------------------------------------------
// 4. Enterprise Graceful Shutdown Handler
// ----------------------------------------------------------------------------
let isShuttingDown = false;

async function handleGracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[Graceful Shutdown] Received signal: ${signal}. Initiating shutdown sequence...`);

  // Forceful exit fallback timer (Prevents process hanging indefinitely)
  const forceExitTimeout = setTimeout(() => {
    console.error('[Graceful Shutdown] Shutdown timed out (10s)! Forcing exit with code 1.');
    process.exit(1);
  }, 10000);

  // Unref timeout so it doesn't hold event loop open if everything closes early
  forceExitTimeout.unref();

  try {
    // Step 1: Stop HTTP server from receiving new requests
    console.log('[HTTP Server] Closing server listener...');
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err) return reject(err);
        console.log('[HTTP Server] Stopped accepting new connections.');
        resolve();
      });
    });

    // Step 2: Disconnect Database & Redis Connection Pools
    await dbPool.disconnect();

    console.log('[Graceful Shutdown] All resources released cleanly. Exiting with code 0.');
    process.exit(0);
  } catch (error) {
    console.error('[Graceful Shutdown] Error during shutdown:', error);
    process.exit(1);
  }
}

// Attach POSIX Signal Listeners
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

// ----------------------------------------------------------------------------
// 5. Unhandled Rejection & Uncaught Exception Handlers
// ----------------------------------------------------------------------------
process.on('unhandledRejection', (reason: unknown) => {
  console.error('[CRITICAL] Unhandled Promise Rejection Detected:', reason);
});

process.on('uncaughtException', (error: Error) => {
  console.error('[CRITICAL] Uncaught Exception Thrown:', error.message);
  handleGracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Simulate auto-shutdown for automated test environments after 1 second
if (process.env['AUTO_TEST_RUN'] === 'true') {
  setTimeout(() => {
    console.log('[Auto Test] Simulating SIGTERM trigger...');
    process.emit('SIGTERM');
  }, 1000);
}
