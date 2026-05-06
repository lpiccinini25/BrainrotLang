import { describe, it, expect } from "@jest/globals";
import compile from "../src/compiler.js";
import * as core from "../src/core.js";

describe("Coverage Boost Tests", () => {
  it("covers FunctionType compatibility in analyzer", () => {
    const source = `
      cook f(g: (sigma) -> sigma) {
        yap(g(1));
      }
      cook h(x: sigma): sigma { it_gave x + 1; }
      f(h);
    `;
    expect(() => compile(source)).not.toThrow();
  });

  it("covers typeName for FunctionType and string in errors", () => {
    const source = `
      cook f(g: (sigma) -> sigma) {}
      f(1);
    `;
    expect(() => compile(source)).toThrow(/Cannot assign a sigma to a \(sigma\) -> sigma/);
    
    const source2 = `
      cook f(s: string) {}
      f(1);
    `;
    expect(() => compile(source2)).toThrow(/Cannot assign a sigma to a string/);
  });

  it("covers short return statement and generation", () => {
    const source = `
      cook f() { it_gave; }
      f();
    `;
    expect(compile(source, "js")).toContain("return;");
  });

  it("covers assignment generation and optimization", () => {
    const source = `
      lowkey x = 1;
      x = 2;
    `;
    const js = compile(source, "js");
    expect(js).toContain("x = 2;");
    const optimized = compile(source, "optimized");
    expect(optimized.statements[1].kind).toBe("Assignment");
  });

  it("covers unary operator generation (non-special)", () => {
    const source = `lowkey x = no_cap; lowkey y = !x; lowkey z = 1; lowkey w = -z;`;
    const js = compile(source, "js");
    expect(js).toContain("!(x)");
    expect(js).toContain("-(z)");
  });

  it("covers conditional expression generation and optimization", () => {
    const source = `lowkey b = no_cap; lowkey x = b ? 1 : 2;`;
    const js = compile(source, "js");
    expect(js).toContain("(b ? 1 : 2)");
    
    const source2 = `lowkey x = no_cap ? 1 : 2;`;
    const optimized = compile(source2, "optimized");
    expect(optimized.statements[0].initializer.value).toBe(1);
    
    const source3 = `lowkey x = cap ? 1 : 2;`;
    const optimized2 = compile(source3, "optimized");
    expect(optimized2.statements[0].initializer.value).toBe(2);
    
    const source4 = `lowkey b = no_cap; lowkey x = b ? 1 : 2;`;
    const optimized4 = compile(source4, "optimized");
    expect(optimized4.statements[1].initializer.kind).toBe("ConditionalExpression");
  });

  it("covers call statement generation and optimization", () => {
    const source = `cook f() {} f();`;
    const js = compile(source, "js");
    expect(js).toContain("f();");
    const optimized = compile(source, "optimized");
    expect(optimized.statements[1].kind).toBe("CallStatement");
  });

  it("covers unary minus optimization", () => {
    const source = `lowkey x = -5;`;
    const optimized = compile(source, "optimized");
    expect(optimized.statements[0].initializer.value).toBe(-5);
  });

  it("covers compiler default output and unknown output type", () => {
    const source = `yap(1);`;
    expect(compile(source)).toBeDefined();
    expect(compile(source, "match")).toBeDefined();
    expect(compile(source, "ast")).toBeDefined();
    expect(compile(source, "analyzed")).toBeDefined();
    expect(compile(source, "unknown")).toContain("console.log(1);");
  });

  it("covers core.type", () => {
    const t = core.type("int");
    expect(t.kind).toBe("Type");
    expect(t.name).toBe("int");
  });

  it("covers string concatenation in analyzer", () => {
    const source = `lowkey x = "a" + "b";`;
    expect(() => compile(source)).not.toThrow();
  });
});
