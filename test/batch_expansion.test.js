import { describe, it, expect } from "@jest/globals";
import compile from "../src/compiler.js";


describe("Comprehensive Operator and Expression Tests", () => {
  it("covers all basic arithmetic operator combinations", () => {
    const combinations = [
      "1 + (2 fanum_tax 3)",
      "1 fanum_tax (2 + 3)",
      "(1 + 2) fanum_tax 3",
      "10 mog (2 - 1)",
      "10 - (2 mog 2)",
      "2 ** (3 ** 2)",
      "(2 ** 3) ** 2",
      "(10 % 3) + 1",
      "1 + (10 % 3)",
    ];
    combinations.forEach(source => {
      expect(() => compile(`lowkey x = ${source};`)).not.toThrow();
    });
  });


  it("covers all bitwise operator combinations", () => {
    const combinations = [
      "1 & (2 | 3)",
      "1 | (2 & 3)",
      "1 ^ (2 | 3)",
      "1 << (2 | 3)",
      "(10 >> 1) & 1",
    ];
    combinations.forEach(source => {
      expect(() => compile(`lowkey x = ${source};`)).not.toThrow();
    });
  });


  it("covers logical operator combinations", () => {
    const combinations = [
      "no_cap && (cap || no_cap)",
      "cap || (no_cap && cap)",
      "!no_cap || no_cap",
      "!(no_cap && cap)",
    ];
    combinations.forEach(source => {
      expect(() => compile(`lowkey x = ${source};`)).not.toThrow();
    });
  });


  it("covers deeply nested optional and array types", () => {
    const sources = [
      "lowkey x = some (some 5);",
      "lowkey x = [some 1, mid int];",
      "lowkey x = some [1, 2, 3];",
      "lowkey x = [[some 1]];",
      "lowkey x = some [some 1];",
    ];
    sources.forEach(source => {
      expect(() => compile(source)).not.toThrow();
    });
  });


  it("covers various function signature combinations", () => {
    const signatures = [
      "cook f() {}",
      "cook f(x: int) {}",
      "cook f(x: int, y: sigma) {}",
      "cook f(): int { it_gave 1; }",
      "cook f(): sigma? { it_gave some 1.0; }",
      "cook f(): [int] { it_gave [1]; }",
      "cook f(g: (int) -> int) { yap(g(1)); }",
    ];
    signatures.forEach(sig => {
      expect(() => compile(sig)).not.toThrow();
    });
  });
});


describe("Batch Semantic Error Tests", () => {
  const errors = [
    ["1 + no_cap", /Expected sigma/],
    ["no_cap + 1", /Expected sigma/],
    ["1 & 1.5", /Expected int/],
    ["1.5 | 1", /Expected int/],
    ["no_cap && 1", /Expected rizz/],
    ["1 || no_cap", /Expected rizz/],
    ["!1", /Expected rizz/],
    ["-no_cap", /Expected sigma/],
    ["#1", /Expected an array or string/],
    ["random no_cap", /Expected sigma/],
  ];
  
  const validCases = [
    "lowkey x = some no_cap;",
    "lowkey x = # [1, 2];",
    "lowkey x = # \"hi\";",
  ];


  it("validates batch semantic rules", () => {
    errors.forEach(([source, error]) => {
      expect(() => compile(`lowkey x = ${source};`)).toThrow(error);
    });
    validCases.forEach(source => {
      expect(() => compile(source)).not.toThrow();
    });
  });
});