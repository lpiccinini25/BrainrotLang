import { describe, it, expect } from "@jest/globals";
import compile from "../src/compiler.js";

describe("High Volume Expression Tests", () => {
  const binaryNumericOps = ["+", "-", "fanum_tax", "mog", "%", "**"];
  const binaryBitwiseOps = ["&", "|", "^", "<<", ">>"];
  
  for (const op1 of binaryNumericOps) {
    for (const op2 of binaryNumericOps) {
      it(`validates numeric expression: 1 ${op1} (2 ${op2} 3)`, () => {
        const source = `lowkey x = 1 ${op1} (2 ${op2} 3);`;
        expect(() => compile(source)).not.toThrow();
      });
    }
  }

  for (const op1 of binaryBitwiseOps) {
    for (const op2 of binaryBitwiseOps) {
      it(`validates bitwise expression: 1 ${op1} (2 ${op2} 3)`, () => {
        const source = `lowkey x = 1 ${op1} (2 ${op2} 3);`;
        expect(() => compile(source)).not.toThrow();
      });
    }
  }
});
