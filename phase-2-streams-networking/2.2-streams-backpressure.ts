import * as fs from 'node:fs';
import * as path from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import * as zlib from 'node:zlib';

/**
 * ============================================================================
 * Topic 2.2: Streams & Backpressure Management
 * ============================================================================
 * 
 * PURPOSE & CORE CONCEPTS:
 * ------------------------
 * 1. Why Streams?
 *    - Reading a 5GB file into memory via `fs.readFile()` crashes V8 (OOM - Out of Memory).
 *    - Streams process data in small chunks (e.g., 64KB) over time, keeping memory footprint flat (O(1) memory usage).
 * 
 * 2. Types of Streams:
 *    - Readable: Source of data (e.g., fs.createReadStream, HTTP request).
 *    - Writable: Destination for data (e.g., fs.createWriteStream, HTTP response).
 *    - Duplex: Both readable and writable (e.g., TCP socket).
 *    - Transform: A Duplex stream that modifies data as it passes through (e.g., zlib, crypto).
 * 
 * 3. Backpressure (The 'highWaterMark'):
 *    - Occurs when data is read from a Readable stream FASTER than a Writable stream can consume it.
 *    - Writable streams buffer data up to `highWaterMark` (default usually 16KB-64KB).
 *    - If `.write(chunk)` returns `false`, backpressure is reached. The Readable must be paused.
 *    - When Writable flushes its buffer, it emits a `'drain'` event, signaling the Readable to resume.
 *    - Using `.pipe()` or `pipeline()` handles all this automatically!
 * 
 * 4. MNC Industry Standard:
 *    - ALWAYS use `stream.pipeline` (or async iterators) instead of `.pipe()`.
 *    - `.pipe()` does NOT forward errors or close intermediate streams if one fails, leading to memory leaks.
 *    - `pipeline` handles cleanup natively.
 * 
 * HOW TO RUN:
 * -----------
 * $ cd phase-2-streams-networking
 * $ npm run demo:2.2
 */

console.log('=== Topic 2.2: Streams & Backpressure ===\n');

const WORK_DIR = path.join(__dirname, 'scratch_streams_demo');
const LARGE_FILE_PATH = path.join(WORK_DIR, 'large-dataset.txt');
const GZIP_FILE_PATH = path.join(WORK_DIR, 'large-dataset.txt.gz');

/**
 * 1. Generating a Large File efficiently without crashing memory
 * Demonstrates manual backpressure handling (what .pipe does internally).
 */
async function generateLargeFileWithBackpressure(): Promise<void> {
  console.log('--- 1. Manual Backpressure Handling (Writing Large Data) ---');
  await fs.promises.mkdir(WORK_DIR, { recursive: true });

  const writable = fs.createWriteStream(LARGE_FILE_PATH, {
    highWaterMark: 16 * 1024, // Artificially low HWM (16KB) to force backpressure for demo
  });

  console.log(`[Writable] Initial highWaterMark: ${writable.writableHighWaterMark} bytes`);

  let i = 0;
  const TOTAL_LINES = 1000000; // 1 million lines (~100MB file)

  return new Promise((resolve, reject) => {
    writable.on('error', reject);

    function writeData() {
      let ok = true;
      // Continue writing while 'ok' is true (no backpressure) and we haven't reached the limit
      while (i < TOTAL_LINES && ok) {
        i++;
        const chunk = `[LINE ${i}] User Action Logged at ${new Date().toISOString()} - payload_size=1024\n`;
        
        if (i === TOTAL_LINES) {
          // Last write
          writable.end(chunk);
          console.log('[Writable] Finished generating data.');
          resolve();
        } else {
          // write() returns false if the internal buffer is full (backpressure)
          ok = writable.write(chunk);
          if (!ok) {
            console.log(`\n[BACKPRESSURE TRIGGERED] Buffer full at line ${i}. Waiting for 'drain'...`);
          }
        }
      }
      
      if (i < TOTAL_LINES) {
        // We stopped because of backpressure. Wait for 'drain' event to resume.
        writable.once('drain', () => {
          console.log(`[DRAIN] Buffer emptied. Resuming write from line ${i}...`);
          writeData();
        });
      }
    }

    writeData();
  });
}

/**
 * 2. Transform Stream & Safe Pipeline (MNC Standard)
 */
async function demonstrateTransformAndPipeline(): Promise<void> {
  console.log('\n--- 2. Transform Streams & stream/promises pipeline() ---');

  const readable = fs.createReadStream(LARGE_FILE_PATH);
  const writable = fs.createWriteStream(GZIP_FILE_PATH);
  
  // Transform Stream: Gzip Compression
  const gzipTransform = zlib.createGzip();

  // Custom Transform Stream: Log progress
  let bytesProcessed = 0;
  const progressTransform = new Transform({
    transform(chunk: Buffer, encoding, callback) {
      bytesProcessed += chunk.length;
      // To pass data along, push it or pass it to callback
      this.push(chunk);
      callback();
    }
  });

  console.log('[Pipeline] Starting stream processing: Read -> Compress -> Write');
  
  const startTime = Date.now();

  try {
    // pipeline handles backpressure natively and ensures ALL streams are destroyed if ANY stream errors
    await pipeline(
      readable,
      progressTransform,
      gzipTransform,
      writable
    );
    console.log(`[Pipeline] Compression complete in ${Date.now() - startTime}ms.`);
    console.log(`[Pipeline] Total bytes processed before compression: ${(bytesProcessed / 1024 / 1024).toFixed(2)} MB`);
    
    const stats = await fs.promises.stat(GZIP_FILE_PATH);
    console.log(`[Pipeline] Compressed file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error('[Pipeline] Stream failed. Native cleanup performed.', error);
  }
}

/**
 * Clean up scratch files
 */
async function cleanup(): Promise<void> {
  console.log('\n--- 3. Cleanup ---');
  await fs.promises.rm(WORK_DIR, { recursive: true, force: true });
  console.log(`[Cleanup] Removed scratch directory: ${WORK_DIR}`);
}

async function main() {
  try {
    await generateLargeFileWithBackpressure();
    await demonstrateTransformAndPipeline();
    await cleanup();
    console.log('\n=== Streams & Backpressure Demonstration Completed ===');
  } catch (error) {
    console.error('Demonstration failed:', error);
  }
}

main();
