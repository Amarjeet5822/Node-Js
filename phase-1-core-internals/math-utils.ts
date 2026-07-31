/**
 * Helper module for Topic 1.3: ESM Named & Default Exports
 */

export interface CalculationResult {
  operation: string;
  a: number;
  b: number;
  result: number;
}

export const add = (a: number, b: number): number => a + b;

export const multiply = (a: number, b: number): number => a * b;

export default class Calculator {
  static compute(a: number, b: number, op: 'add' | 'multiply'): CalculationResult {
    const res = op === 'add' ? add(a, b) : multiply(a, b);
    return { operation: op, a, b, result: res };
  }
}
