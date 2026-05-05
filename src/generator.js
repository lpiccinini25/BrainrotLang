export default function generate(program) {
  const gen = (node) => {
    if (node === null || node === undefined) return "";
    return generators[node.kind]?.(node) ?? "";
  };

  const generators = {
    Program(p) {
      return p.statements.map(gen).join("\n");
    },
    VariableDeclaration(d) {
      const modifier = d.readOnly ? "const" : "let";
      return `${modifier} ${d.name} = ${gen(d.initializer)};`;
    },
    Variable(v) {
      return v.name;
    },
    PrintStatement(s) {
      return `console.log(${gen(s.expression)});`;
    },
    Assignment(s) {
      return `${gen(s.target)} = ${gen(s.source)};`;
    },
    BinaryExpression(e) {
      const op = e.op === "==" ? "===" : e.op === "!=" ? "!==" : e.op;
      return `(${gen(e.left)} ${op} ${gen(e.right)})`;
    },
    UnaryExpression(e) {
      const op = { "#": "length", random: "Math.random", some: "" }[e.op];
      if (op === "length") return `${gen(e.operand)}.length`;
      if (op === "Math.random") return `(Math.random() * ${gen(e.operand)})`;
      if (e.op === "some") return gen(e.operand);
      return `${e.op}(${gen(e.operand)})`;
    },
    Literal(l) {
      if (Array.isArray(l.value)) {
        return `[${l.value.map(gen).join(", ")}]`;
      }
      return JSON.stringify(l.value);
    },
    ConstructorCall(c) {
      const properties = c.aura.fields.map((f, i) => `${f.name}: ${gen(c.args[i])}`);
      return `{ ${properties.join(", ")} }`;
    },
    IfStatement(s) {
      const block = Array.isArray(s.consequent)
        ? s.consequent.map(gen).join("\n")
        : gen(s.consequent);
      let output = `if (${gen(s.test)}) { ${block} }`;
      if (s.alternate) {
        const altBlock = Array.isArray(s.alternate)
          ? s.alternate.map(gen).join("\n")
          : gen(s.alternate);
        output += ` else { ${altBlock} }`;
      }
      return output;
    },
    WhileStatement(s) {
      return `while (${gen(s.test)}) { ${s.body.map(gen).join("\n")} }`;
    },
    RepeatStatement(s) {
      return `for (let _i = 0; _i < ${gen(s.count)}; _i++) { ${s.body.map(gen).join("\n")} }`;
    },
    ForRangeStatement(s) {
      const endOp = s.op === "..." ? "<=" : "<";
      return `for (let ${s.iterator.name} = ${gen(s.low)}; ${s.iterator.name} ${endOp} ${gen(s.high)}; ${s.iterator.name}++) { ${s.body.map(gen).join("\n")} }`;
    },
    ForCollectionStatement(s) {
      return `for (let ${s.iterator.name} of ${gen(s.collection)}) { ${s.body.map(gen).join("\n")} }`;
    },
    FunctionDeclaration(d) {
      const params = d.fun.params.map(gen).join(", ");
      return `function ${d.fun.name}(${params}) {\n${d.body.map(gen).join("\n")}\n}`;
    },
    FunctionObject(f) {
      return f.name;
    },
    Parameter(p) {
      return p.name;
    },
    ReturnStatement(s) {
      return `return ${gen(s.expression)};`;
    },
    ShortReturnStatement() {
      return `return;`;
    },
    BreakStatement() {
      return `break;`;
    },
    CallStatement(s) {
      return `${gen(s.call)};`;
    },
    CallExpression(e) {
      const args = e.args.map(gen).join(", ");
      return `${gen(e.callee)}(${args})`;
    },
    SubscriptExpression(e) {
      return `${gen(e.array)}[${gen(e.index)}]`;
    },
    MemberExpression(e) {
      const op = e.op === "?." ? "?." : ".";
      return `${gen(e.object)}${op}${e.field.name}`;
    },
  };

  return gen(program);
}
