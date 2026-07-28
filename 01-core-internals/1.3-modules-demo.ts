import Calculator, { add, multiply, CalculationResult } from './math-utils';

/**
 * ============================================================================
 * Topic 1.3: Modules System & TypeScript Setup (CJS vs ESM & Interop)
 * ============================================================================
 * 
 * PURPOSE & CORE CONCEPTS:
 * ------------------------
 * 1. CommonJS (CJS):
 *    - Uses require() and module.exports.
 *    - Synchronous module resolution at runtime.
 *    - Default format in traditional Node.js.
 * 
 * 2. ECMAScript Modules (ESM):
 *    - Uses import / export statements.
 *    - Static structure (enables Tree-Shaking and static analysis).
 *    - Asynchronous module loading & supports Top-Level Await.
 * 
 * 3. CommonJS vs ESM Interoperability:
 *    - ESM can import CJS modules natively.
 *    - CJS CANNOT require() pure ESM modules synchronously (requires dynamic import()).
 * 
 * 4. Enterprise TypeScript Setup (TSConfig Path Aliases & Module Resolution):
 *    - Clean module resolution avoids fragile relative imports like ../../../../services/user.service
 *    - Standardized using baseUrl and paths in tsconfig.json.
 * 
 * HOW TO RUN THIS FILE:
 * ---------------------
 * $ npx tsx 01-core-internals/1.3-modules-demo.ts
 * OR
 * $ npm run demo:1.3
 */

console.log('=== Topic 1.3: Node.js Module System & ESM Demonstration ===\n');

// 1. ESM Named Exports Usage
const sum = add(15, 25);
const product = multiply(6, 7);

console.log(`[ESM Named Export] add(15, 25) = ${sum}`);
console.log(`[ESM Named Export] multiply(6, 7) = ${product}`);

// 2. ESM Default Export Class Usage
const calcResult: CalculationResult = Calculator.compute(10, 4, 'multiply');
console.log(`[ESM Default Export] Calculator.compute(10, 4, 'multiply') =`, calcResult);

// 3. Dynamic Module Import (ESM Dynamic import() works in both CJS & ESM)
async function loadDynamicModule() {
  console.log('\n--- Dynamic Import () Demonstration ---');
  // Dynamically importing Node's native 'os' module
  const os = await import('os');
  console.log(`[Dynamic Import] Host OS: ${JSON.stringify(os.userInfo())}`);
  console.log(`[Dynamic Import] Host OS Platform: ${os.platform()}`);
  console.log(`[Dynamic Import] CPU Architecture: ${os.arch()}`);
  console.log(`[Dynamic Import] System Uptime: ${Math.round(os.uptime() / 60)} minutes`);
}

// 4. CommonJS Interop (Requiring standard CJS module in TS)
function demonstrateCJSInterop() {
  console.log('\n--- CommonJS Interoperability Demonstration ---');
  // Using require() via Node CJS engine / ts-node runtime
  const path = require('path');
  const resolvedPath = path.resolve(__dirname, 'math-utils.ts');
  console.log(`[CJS require()] Resolved Absolute Path: ${resolvedPath}`);
}

async function main() {
  await loadDynamicModule();
  demonstrateCJSInterop();
  console.log('\n=== Module System Demonstration Completed ===');
}

main().catch(console.error);
