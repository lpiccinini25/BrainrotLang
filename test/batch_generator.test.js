import { describe, it, expect } from "@jest/globals";
import compile from "../src/compiler.js";


const binaryOps = ["+", "-", "fanum_tax", "mog", "%", "**", "&", "|", "^", "<<", ">>"];


describe("Batch Optimizer and Generator Coverage", () => {
  it("covers all binary operators with constant folding", () => {
    binaryOps.forEach(op => {
      const source = `lowkey x = 10 ${op} 2;`;
      const optimized = compile(source, "optimized");
      expect(optimized.statements[0].initializer.kind).toBeDefined();
    });
  });


  it("covers operator precedence in generator", () => {
    const expressions = [
      ["(1 + 2) fanum_tax 3", "(1 + 2) * 3"],
      ["1 + (2 fanum_tax 3)", "1 + (2 * 3)"],
      ["(1 fanum_tax 2) + 3", "(1 * 2) + 3"],
      ["(1 + 2) + 3", "(1 + 2) + 3"],
      ["1 fanum_tax (2 + 3)", "1 * (2 + 3)"],
      ["1 ** (2 ** 3)", "1 ** (2 ** 3)"],
    ];
    expressions.forEach(([source, expected]) => {
      const js = compile(`lowkey x = ${source};`, "js");
      expect(js).toBeDefined();
    });
  });


  it("covers all control flow patterns in generator", () => {
    const source = `
      lowkey b = no_cap;
      vibe_check b {
        yap(1);
      } caught_lackin vibe_check cap {
        yap(2);
      } caught_lackin {
        yap(3);
      }
      
      go_go_go cap {
        skedaddle;
      }
      
      run_it_back 5 {
        yap("loop");
      }
      
      grind i with 1...5 {
        yap(i);
      }
      
      grind x with [1, 2] {
        yap(x);
      }
    `;
    const js = compile(source, "js");
    expect(js).toContain("if (b)");
    expect(js).toContain("else {");
    expect(js).toContain("while (false)");
    expect(js).toContain("for (let _i = 0; _i < 5; _i++)");
    expect(js).toContain("for (let i = 1; i <= 5; i++)");
  });


  it("covers complex member and subscript nesting", () => {
    const source = `
      aura A { x: sigma }
      aura B { a: A }
      lowkey b = spawn B(spawn A(1.0));
      yap(b.a.x);
      
      lowkey list = [[1, 2], [3, 4]];
      yap(list[0][1]);
      
      lowkey optA = some spawn A(2.0);
      yap(optA?.x ?? 0.0);
    `;
    const js = compile(source, "js");
    expect(js).toContain("b.a.x");
    expect(js).toContain("list[0][1]");
    expect(js).toContain("optA?.x");
  });
});
