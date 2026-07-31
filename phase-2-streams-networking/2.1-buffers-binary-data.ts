import { Buffer } from 'node:buffer';

/**
 * ============================================================================
 * Topic 2.1: Buffers & Binary Data (Binary Manipulation, Encodings & Memory)
 * ============================================================================
 * 
 * PURPOSE & CORE CONCEPTS:
 * ------------------------
 * 1. What is a Buffer?
 *    - Node.js `Buffer` represents a fixed-size chunk of raw binary memory allocated
 *      OUTSIDE the V8 JavaScript Heap (in C++ unmanaged memory).
 *    - Each element in a Buffer is an 8-bit unsigned integer (byte value: 0 to 255 / 0x00 to 0xFF).
 * 
 * 2. Memory Allocation Strategies:
 *    - `Buffer.alloc(size)`: Safe. Allocates memory and fills it with 0s.
 *    - `Buffer.allocUnsafe(size)`: Extremely fast, but dangerous! Does NOT zero out memory.
 *      It may contain sensitive remnant data (passwords, tokens) from old process memory.
 *    - `Buffer.from(data)`: Copies string/array bytes into a new Buffer instance.
 * 
 * 3. Buffer Slicing & Memory References:
 *    - `buf.subarray(start, end)` (or `buf.slice`): Creates a view over the SAME underlying
 *      `ArrayBuffer` without copying memory. Modifying a subarray modifies the original Buffer!
 * 
 * 4. MNC Industry Standard Use Case:
 *    - Network Packet Parsing (TCP/UDP custom protocols, image uploading, payload hashing).
 * 
 * HOW TO RUN:
 * -----------
 * $ cd phase-2-streams-networking
 * $ npm run demo:2.1
 */

console.log('=== Topic 2.1: Buffers & Binary Data ===\n');

// ----------------------------------------------------------------------------
// 1. Safe vs Unsafe Allocation Demonstration
// ----------------------------------------------------------------------------
console.log('--- 1. Memory Allocation Strategies ---');

// Safe allocation: filled with zeroes (0x00)
const safeBuf = Buffer.alloc(8);
console.log('[Buffer.alloc(8)] Safe Zeros:', safeBuf);

// Unsafe allocation: fast, uninitialized memory slots
const unsafeBuf = Buffer.allocUnsafe(8);
console.log('[Buffer.allocUnsafe(8)] Uninitialized Raw Bytes:', unsafeBuf);
// Always fill or write over unsafe buffers immediately if used for performance!
unsafeBuf.fill(0); 

// ----------------------------------------------------------------------------
// 2. Encoding Conversions (UTF-8, Hex, Base64)
// ----------------------------------------------------------------------------
console.log('\n--- 2. Encodings & Conversions ---');

const secretString = 'Enterprise Node.js Backend Engine 🚀';
const utf8Buf = Buffer.from(secretString, 'utf-8');

console.log(`String Length: ${secretString.length} characters`);
console.log(`Buffer Byte Length: ${utf8Buf.byteLength} bytes (UTF-8 emojis take 4 bytes!)`);
console.log(`Hex Representation:`, utf8Buf.toString('hex'));
console.log(`Base64 Representation:`, utf8Buf.toString('base64'));

// Decoding Base64 back to UTF-8
const base64Str = utf8Buf.toString('base64');
const decodedBuf = Buffer.from(base64Str, 'base64');
console.log(`Decoded from Base64: "${decodedBuf.toString('utf-8')}"`);

// ----------------------------------------------------------------------------
// 3. Subarrays (Views vs Deep Copies)
// ----------------------------------------------------------------------------
console.log('\n--- 3. Subarray Memory References ---');

const originalBuf = Buffer.from('HELLO WORLD');
const subView = originalBuf.subarray(0, 5); // Points to SAME memory slot

console.log(`Original: "${originalBuf.toString()}"`);
console.log(`Subarray View (0..5): "${subView.toString()}"`);

// Mutate subView
subView.write('NINJA');
console.log(`[After Mutating Subarray] Original Buffer is modified! -> "${originalBuf.toString()}"`);

// ----------------------------------------------------------------------------
// 4. Binary Chunk Concatenation (Buffer.concat)
// ----------------------------------------------------------------------------
console.log('\n--- 4. Concatenating Binary Stream Chunks ---');

const chunk1 = Buffer.from('Chunk #1 | ');
const chunk2 = Buffer.from('Chunk #2 | ');
const chunk3 = Buffer.from('Chunk #3');

// Combine chunks efficiently
const combined = Buffer.concat([chunk1, chunk2, chunk3]);
console.log(`Combined Buffer (${combined.byteLength} bytes): "${combined.toString()}"`);

// ----------------------------------------------------------------------------
// 5. Industry Standard Use Case: Parsing Custom Binary Protocol Header
// ----------------------------------------------------------------------------
console.log('\n--- 5. Industry Use Case: Custom Binary Protocol Header Parser ---');

/**
 * Protocol Packet Spec:
 * Byte 0..1: Magic Identifier (2 bytes, e.g. 0x41 0x47 = 'AG')
 * Byte 2: Version Number (1 byte, e.g. 1)
 * Byte 3..6: Payload Length (4 bytes Unsigned Big-Endian Integer)
 * Byte 7..n: JSON Payload bytes
 */
function createProtocolPacket(payload: object): Buffer {
  const jsonString = JSON.stringify(payload);
  const payloadBuf = Buffer.from(jsonString, 'utf-8');
  
  const headerBuf = Buffer.alloc(7);
  headerBuf.write('AG', 0, 2, 'ascii');             // Magic Bytes
  headerBuf.writeUInt8(1, 2);                       // Version 1
  headerBuf.writeUInt32BE(payloadBuf.byteLength, 3); // 32-bit Big-Endian Payload Size

  return Buffer.concat([headerBuf, payloadBuf]);
}

function parseProtocolPacket(packet: Buffer) {
  const magic = packet.toString('ascii', 0, 2);
  if (magic !== 'AG') throw new Error(`Invalid Protocol Magic Bytes: ${magic}`);

  const version = packet.readUInt8(2);
  const payloadLength = packet.readUInt32BE(3);
  const payloadJson = packet.toString('utf-8', 7, 7 + payloadLength);

  return {
    magic,
    version,
    payloadLength,
    data: JSON.parse(payloadJson),
  };
}

// Test Binary Packet Protocol
const packetBuffer = createProtocolPacket({ event: 'ORDER_PLACED', orderId: 88491, total: 199.50 });
console.log(`Generated Raw Binary Packet (${packetBuffer.byteLength} bytes):`, packetBuffer);

const parsedPacket = parseProtocolPacket(packetBuffer);
console.log(`Parsed Protocol Packet:`, parsedPacket);

console.log('\n=== Buffers & Binary Data Demonstration Completed ===');
