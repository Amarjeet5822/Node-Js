import * as fs from 'fs';
import * as path from 'path';

/**
 * ============================================================================
 * Topic 1.2: Event Loop Lifecycle & Microtask Priority Demonstration
 * ============================================================================
 * 
 * PURPOSE & CORE CONCEPTS:
 * ------------------------
 * The Node.js Event Loop handles asynchronous callbacks across 6 distinct phases:
 * 
 *  ┌───────────────────────────┐
 *  │          TIMERS           │ <-- setTimeout(), setInterval()
 *  └─────────────┬─────────────┘
 *  ┌─────────────▼─────────────┐
 *  │     PENDING CALLBACKS     │ <-- Deferred I/O callbacks (e.g. TCP errors)
 *  └─────────────┬─────────────┘
 *  ┌─────────────▼─────────────┐
 *  │       IDLE, PREPARE       │ <-- Internal Node.js usage
 *  └─────────────┬─────────────┘
 *  ┌─────────────▼─────────────┐
 *  │           POLL            │ <-- Retrieves I/O events; executes FS/Network callbacks
 *  └─────────────┬─────────────┘
 *  ┌─────────────▼─────────────┐
 *  │           CHECK           │ <-- setImmediate() callbacks
 *  └─────────────┬─────────────┘
 *  ┌─────────────▼─────────────┐
 *  │      CLOSE CALLBACKS      │ <-- e.g., socket.on('close', ...)
 *  └───────────────────────────┘
 * 
 * MICROTASK QUEUES (Executed IMMEDIATELY after Call Stack drains, before moving to next phase):
 * 1. process.nextTick() Queue  --> HIGHEST PRIORITY (Runs before Promise microtasks)
 * 2. Promise / queueMicrotask  --> SECOND PRIORITY (Runs after nextTick queue is empty)
 * 
 * CRITICAL DISAMBIGUATION: setImmediate() vs setTimeout(fn, 0)
 * - Outside I/O: Execution order depends on CPU speed and process startup performance.
 * - Inside Poll Phase (I/O Callbacks): setImmediate() is ALWAYS executed BEFORE setTimeout(fn, 0)
 *   because the loop advances from Poll phase directly to Check phase!
 * 
 * INDUSTRY PITFALL / WARNING:
 * ---------------------------
 * Recursive process.nextTick() calls will completely STARVE the Event Loop, blocking I/O,
 * Timers, and setImmediate from ever executing, causing catastrophic API hangs.
 * 
 * HOW TO RUN:
 * -----------
 * $ npx tsx 01-core-internals/1.2-event-loop-lifecycle.ts
 * OR
 * $ npm run demo:1.2
 */

console.log('=== 1. START: Synchronous Code on Call Stack ===');

// ----------------------------------------------------------------------------
// 1. Timers Phase
// ----------------------------------------------------------------------------
setTimeout(() => {
  console.log('=== 7. Macrotask: setTimeout(0ms) [Timers Phase] ===');
}, 0);

// ----------------------------------------------------------------------------
// 2. Check Phase
// ----------------------------------------------------------------------------
setImmediate(() => {
  console.log('=== 8. Macrotask: setImmediate() [Check Phase] ===');
});

// ----------------------------------------------------------------------------
// 3. Microtask Queue 2: Promise Microtasks
// ----------------------------------------------------------------------------
Promise.resolve().then(() => {
  console.log('=== 4. Microtask: Promise.resolve().then() ===');
});

queueMicrotask(() => {
  console.log('=== 5. Microtask: queueMicrotask() ===');
});

// ----------------------------------------------------------------------------
// 4. Microtask Queue 1: process.nextTick (Runs BEFORE Promises!)
// ----------------------------------------------------------------------------
process.nextTick(() => {
  console.log('=== 3. Microtask: process.nextTick() [Highest Priority] ===');
  
  // Nested nextTick runs before moving to Promises or Macrotasks
  process.nextTick(() => {
    console.log('=== 3b. Nested process.nextTick() ===');
  });
});

// ----------------------------------------------------------------------------
// 5. Poll Phase (I/O Callback Behavior)
// ----------------------------------------------------------------------------
const filePath = path.join(__dirname, '../../package.json');

fs.readFile(filePath, () => {
  console.log('\n--- INSIDE POLL PHASE (I/O Callback) ---');

  setTimeout(() => {
    console.log('-> setTimeout(0) inside I/O Callback [Timers Phase on NEXT loop turn]');
  }, 0);

  setImmediate(() => {
    console.log('-> setImmediate() inside I/O Callback [Check Phase on CURRENT loop turn - ALWAYS FIRST!]');
  });

  process.nextTick(() => {
    console.log('-> process.nextTick() inside I/O Callback [Executes immediately before Check Phase]');
  });
});

console.log('=== 2. END: Synchronous Code Finished ===\n');
