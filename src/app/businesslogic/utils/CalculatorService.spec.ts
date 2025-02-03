// CalculatorService.spec.ts
import { CalculatorService } from './CalculatorService';

describe('CalculatorService', () => {
  let service: CalculatorService;

  beforeEach(() => {
    service = new CalculatorService();
  });

  it('should add two numbers correctly', () => {
    const result = service.add(5, 3); // 5 + 3 = 8
    expect(result).toBe(8);
  });

  it('should subtract two numbers correctly', () => {
    const result = service.subtract(10, 4); // 10 - 4 = 6
    expect(result).toBe(6);
  });

  it('should multiply two numbers correctly', () => {
    const result = service.multiply(6, 7); // 6 * 7 = 42
    expect(result).toBe(42);
  });

  it('should divide two numbers correctly', () => {
    const result = service.divide(20, 5); // 20 / 5 = 4
    expect(result).toBe(4);
  });

  it('should throw an error when dividing by zero', () => {
    expect(() => {
      service.divide(10, 0);
    }).toThrowError('Division by zero is not allowed.');
  });
});
