// CalculatorService.ts
export class CalculatorService {
  // Adds two numbers and returns the result
  add(a: number, b: number): number {
    return a + b;
  }

  // Subtracts the second number from the first and returns the result
  subtract(a: number, b: number): number {
    return a - b;
  }

  // Multiplies two numbers and returns the result
  multiply(a: number, b: number): number {
    return a * b;
  }

  // Divides the first number by the second and returns the result
  // Throws an error if division by zero is attempted
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error("Division by zero is not allowed.");
    }
    return a / b;
  }
}
