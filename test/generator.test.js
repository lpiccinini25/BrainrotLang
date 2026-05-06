import compile from "../src/compiler.js";

describe("The Optimizer and Generator", () => {
  it("optimizes constant expressions", () => {
    const source = `lowkey x = 2 fanum_tax 3 + 5;`;
    const optimizedAst = compile(source, "optimized");
    expect(optimizedAst.statements[0].initializer.value).toBe(11);
  });

  it("generates correct JavaScript", () => {
    const source = `
      lowkey x = 10;
      cook f(a: sigma): sigma {
        it_gave a + 1;
      }
      yap(f(x));
    `;
    const jsCode = compile(source, "js");
    expect(jsCode).toContain("let x = 10;");
    expect(jsCode).toContain("function f(a) {");
    expect(jsCode).toContain("return (a + 1);");
    expect(jsCode).toContain("console.log(f(x));");
  });

  it("generates loops and conditionals", () => {
    const source = `
      run_it_back 5 {
        vibe_check no_cap { yap(1); } caught_lackin { yap(0); }
      }
      go_go_go cap {
        skedaddle;
      }
    `;
    const jsCode = compile(source, "js");
    expect(jsCode).toContain("for (let _i = 0; _i < 5; _i++) {");
    expect(jsCode).toContain(
      "if (true) { console.log(1); } else { console.log(0); }",
    );
    expect(jsCode).toContain("while (false) { break; }");
  });
});
