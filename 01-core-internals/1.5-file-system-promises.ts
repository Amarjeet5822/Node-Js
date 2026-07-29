import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * ============================================================================
 * Topic 1.5: Native File System (`fs/promises`, File Descriptors & Error Codes)
 * ============================================================================
 * 
 * PURPOSE & CORE CONCEPTS:
 * ------------------------
 * 1. fs/promises API:
 *    - Asynchronous Promise-based File System methods.
 *    - Offloaded to Libuv thread pool (does NOT block V8 Call Stack).
 * 
 * 2. File Descriptors (FD):
 *    - Low-level integer handles managed by OS to track open files/sockets.
 *    - Obtained via `fs.open()`. MUST be explicitly closed with `handle.close()`
 *      to avoid `EMFILE: too many open files` OS leaks.
 * 
 * 3. System Error Codes (POSIX/Node.js):
 *    - `ENOENT`: Error No Entity (File/Directory does not exist).
 *    - `EEXIST`: Error Entity Exists (Directory/File already exists).
 *    - `EACCES`: Error Access (Permission denied).
 *    - `EMFILE`: Error Maximum Files (Process reached file descriptor limit).
 * 
 * 4. MNC Best Practice Rules:
 *    - NEVER call sync methods (e.g. `fs.readFileSync`) inside HTTP API handlers.
 *    - Always manage File Handles in `try...finally` blocks.
 * 
 * HOW TO RUN THIS FILE:
 * ---------------------
 * $ npx tsx 01-core-internals/1.5-file-system-promises.ts
 * OR
 * $ npm run demo:1.5
 */

const WORK_DIR = path.join(__dirname, 'scratch_fs_demo');

/**
 * 1. Safe Directory Creation & File Writing
 */
async function setupDemoDirectory(): Promise<string> {
  console.log('--- 1. Creating Directory & Writing Logs ---');
  
  // Create directory recursively (No error if already exists)
  await fs.mkdir(WORK_DIR, { recursive: true });
  console.log(`[FS] Directory created/verified: ${WORK_DIR}`);

  const filePath = path.join(WORK_DIR, 'app-audit.log');
  const initialContent = `[${new Date().toISOString()}] SYSTEM_INIT: Application started.\n`;

  await fs.writeFile(filePath, initialContent, { encoding: 'utf-8' });
  console.log(`[FS] File written successfully: ${path.basename(filePath)}`);

  // Append new log entry asynchronously
  const appendContent = `[${new Date().toISOString()}] USER_LOGIN: User #1042 logged in.\n`;
  await fs.appendFile(filePath, appendContent, { encoding: 'utf-8' });
  console.log(`[FS] Log appended to: ${path.basename(filePath)}`);

  return filePath;
}

/**
 * 2. Low-level File Handle (File Descriptor) Usage with Cleanup
 */
async function demonstrateFileHandle(filePath: string): Promise<void> {
  console.log('\n--- 2. Low-level File Descriptor (fs.open) ---');
  let fileHandle: fs.FileHandle | null = null;

  try {
    // Open file in read-mode ('r') to receive a FileHandle object
    fileHandle = await fs.open(filePath, 'r');
    console.log(`[FileHandle] File Descriptor FD assigned by OS: ${fileHandle.fd}`);

    // Read stat metadata via handle
    const stats = await fileHandle.stat();
    console.log(`[FileHandle] File Size: ${stats.size} bytes`);
    console.log(`[FileHandle] Created At: ${stats.birthtime.toISOString()}`);

    // Read partial buffer content
    const buffer = Buffer.alloc(64);
    const { bytesRead } = await fileHandle.read(buffer, 0, 64, 0);
    console.log(`[FileHandle] Read ${bytesRead} bytes: "${buffer.toString('utf-8', 0, bytesRead).trim()}"`);

  } finally {
    // CRITICAL: Always close file handle in finally block to prevent FD leaks!
    if (fileHandle) {
      await fileHandle.close();
      console.log(`[FileHandle] File Descriptor ${fileHandle.fd} closed cleanly.`);
    }
  }
}

/**
 * 3. Handling Node.js System Error Codes (ENOENT / EEXIST)
 */
async function demonstrateErrorHandling(): Promise<void> {
  console.log('\n--- 3. System Error Code Handling (ENOENT) ---');
  const nonExistentPath = path.join(WORK_DIR, 'missing-config.json');

  try {
    await fs.readFile(nonExistentPath, 'utf-8');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.log(`[Caught Expected System Error] Code: ${error.code} | Message: ${error.message}`);
      console.log(`[Graceful Fallback] Loading default system configurations...`);
    } else {
      throw error; // Re-throw unknown unexpected errors
    }
  }
}

/**
 * 4. Recursive Directory Scanning (Dirent Objects)
 */
async function scanDirectoryStructure(): Promise<void> {
  console.log('\n--- 4. Recursive Directory Scanning ---');
  const entries = await fs.readdir(WORK_DIR, { withFileTypes: true });

  for (const entry of entries) {
    const type = entry.isDirectory() ? 'DIR' : entry.isFile() ? 'FILE' : 'OTHER';
    console.log(` - [${type}] ${entry.name}`);
  }
}

/**
 * Clean up scratch files
 */
async function cleanup(): Promise<void> {
  console.log('\n--- 5. Cleanup ---');
  await fs.rm(WORK_DIR, { recursive: true, force: true });
  console.log(`[Cleanup] Removed scratch directory: ${WORK_DIR}`);
}

async function main() {
  const filePath = await setupDemoDirectory();
  await demonstrateFileHandle(filePath);
  await demonstrateErrorHandling();
  await scanDirectoryStructure();
  await cleanup();
  console.log('\n=== File System Demonstration Completed ===');
}

main().catch(console.error);
