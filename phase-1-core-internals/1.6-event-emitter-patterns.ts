import { EventEmitter } from 'events';

/**
 * ============================================================================
 * Topic 1.6: Event Emitter & Event-Driven Patterns
 * ============================================================================
 * 
 * PURPOSE & CORE CONCEPTS:
 * ------------------------
 * 1. EventEmitter Architecture:
 *    - Node's core event-driven architecture pattern (Observer Pattern).
 *    - Listeners attached to an EventEmitter instance execute SYNCHRONOUSLY
 *      in the order they were registered when `.emit()` is invoked.
 * 
 * 2. The Special 'error' Event:
 *    - If an EventEmitter emits an 'error' event and has NO registered listener
 *      for 'error', Node.js treats it as an uncaught exception and CRASHES the process!
 * 
 * 3. Memory Leak Prevention & MaxListeners:
 *    - Node defaults `defaultMaxListeners` to 10 per event.
 *    - Exceeding 10 listeners triggers `MaxListenersExceededWarning` to alert developers
 *      that references (closures) might be leaking in memory.
 * 
 * 4. Enterprise Type-Safe Domain Events:
 *    - In MNC TypeScript backends, raw string event names lead to typos and bugs.
 *    - We construct strongly-typed EventEmitter contracts.
 * 
 * HOW TO RUN THIS FILE:
 * ---------------------
 * $ npx tsx 01-core-internals/1.6-event-emitter-patterns.ts
 * OR
 * $ npm run demo:1.6
 */

// ----------------------------------------------------------------------------
// 1. Strongly-Typed Domain Event Definitions
// ----------------------------------------------------------------------------
interface OrderCreatedPayload {
  orderId: string;
  amount: number;
  customerId: string;
}

interface PaymentFailedPayload {
  orderId: string;
  reason: string;
}

// Map Event Names to Payload Types
interface OrderDomainEvents {
  'order:created': (payload: OrderCreatedPayload) => void;
  'payment:failed': (payload: PaymentFailedPayload) => void;
  'error': (error: Error) => void;
}

/**
 * Type-Safe Wrapper around Node.js EventEmitter
 */
class OrderEventBus extends EventEmitter {
  constructor() {
    super();
    // Configure higher max listeners limit explicitly if needed
    this.setMaxListeners(15);
  }

  // Type-safe emit override
  override emit<K extends keyof OrderDomainEvents>(
    event: K,
    ...args: Parameters<OrderDomainEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  // Type-safe listener registration override
  override on<K extends keyof OrderDomainEvents>(
    event: K,
    listener: OrderDomainEvents[K]
  ): this {
    return super.on(event, listener);
  }

  override once<K extends keyof OrderDomainEvents>(
    event: K,
    listener: OrderDomainEvents[K]
  ): this {
    return super.once(event, listener);
  }
}

// ----------------------------------------------------------------------------
// 2. Demonstration Script
// ----------------------------------------------------------------------------

const eventBus = new OrderEventBus();

console.log('=== 1. Registering Domain Listeners ===');

// Listener 1: Order Audit Logger (recurring)
const auditLogger = (payload: OrderCreatedPayload) => {
  console.log(`[Audit Service] Logged Order #${payload.orderId} for $${payload.amount}`);
};
eventBus.on('order:created', auditLogger);

// Listener 2: Email Notification (One-time only via .once())
eventBus.once('order:created', (payload) => {
  console.log(`[Email Service] (ONCE ONLY) Sending confirmation email to Customer #${payload.customerId}`);
});

// Listener 3: Critical Error Listener (Prevents Process Crash!)
eventBus.on('error', (err) => {
  console.error(`[Error Handler] Caught EventEmitter Error gracefully: "${err.message}"`);
});

// ----------------------------------------------------------------------------
// 3. Emitting Events
// ----------------------------------------------------------------------------

console.log('\n--- Emitting First Order Event ---');
eventBus.emit('order:created', {
  orderId: 'ORD-9021',
  amount: 249.99,
  customerId: 'CUST-551',
});

console.log('\n--- Emitting Second Order Event ---');
// Notice Email Service will NOT trigger this time because it used .once()!
eventBus.emit('order:created', {
  orderId: 'ORD-9022',
  amount: 49.50,
  customerId: 'CUST-782',
});

// ----------------------------------------------------------------------------
// 4. Memory Leak Prevention & Listener Deregistration
// ----------------------------------------------------------------------------
console.log('\n--- Listener Deregistration & Memory Leak Prevention ---');
console.log(`Listener count for 'order:created' BEFORE removal: ${eventBus.listenerCount('order:created')}`);

// Remove specific listener
eventBus.off('order:created', auditLogger);
console.log(`Listener count for 'order:created' AFTER removal: ${eventBus.listenerCount('order:created')}`);

// ----------------------------------------------------------------------------
// 5. Handling Error Events Safely
// ----------------------------------------------------------------------------
console.log('\n--- Emitting Error Event ---');
eventBus.emit('error', new Error('Database Connection Timeout during Order Processing'));

console.log('\n=== Event Emitter Demonstration Completed ===');
