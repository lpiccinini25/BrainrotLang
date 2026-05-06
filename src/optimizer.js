import * as core from "./core.js";

export default function optimize(node) {
  if (node === null || node === undefined) return node;
  return optimizers[node.kind]?.(node) ?? node;
}

const optimizers = {
  Program(p) {
    p.statements = p.statements.map(optimize);
    return p;
  },
  VariableDeclaration(d) {
    d.initializer = optimize(d.initializer);
    return d;
  },
  PrintStatement(s) {
    s.expression = optimize(s.expression);
    return s;
  },
  Assignment(s) {
    s.source = optimize(s.source);
    s.target = optimize(s.target);
    return s;
  },
  IfStatement(s) {
    s.test = optimize(s.test);
    s.consequent = s.consequent.map
      ? s.consequent.map(optimize)
      : optimize(s.consequent);
    if (s.alternate) {
      s.alternate = s.alternate.map
        ? s.alternate.map(optimize)
        : optimize(s.alternate);
    }
    return s;
  },
  WhileStatement(s) {
    s.test = optimize(s.test);
    s.body = s.body.map(optimize);
    return s;
  },
  RepeatStatement(s) {
    s.count = optimize(s.count);
    s.body = s.body.map(optimize);
    return s;
  },
  ForRangeStatement(s) {
    s.low = optimize(s.low);
    s.high = optimize(s.high);
    s.body = s.body.map(optimize);
    return s;
  },
  ForCollectionStatement(s) {
    s.collection = optimize(s.collection);
    s.body = s.body.map(optimize);
    return s;
  },
  FunctionDeclaration(d) {
    d.body = d.body.map(optimize);
    return d;
  },
  CallStatement(s) {
    s.call = optimize(s.call);
    return s;
  },
  CallExpression(e) {
    e.callee = optimize(e.callee);
    e.args = e.args.map(optimize);
    return e;
  },
  ReturnStatement(s) {
    s.expression = optimize(s.expression);
    return s;
  },
  BinaryExpression(e) {
    e.left = optimize(e.left);
    e.right = optimize(e.right);
    if (e.left.kind === "Literal" && e.right.kind === "Literal") {
      if (
        typeof e.left.value === "number" &&
        typeof e.right.value === "number"
      ) {
        if (e.op === "+")
          return core.literal(e.left.value + e.right.value, core.numberType);
        if (e.op === "-")
          return core.literal(e.left.value - e.right.value, core.numberType);
        if (e.op === "*")
          return core.literal(e.left.value * e.right.value, core.numberType);
        if (e.op === "/")
          return core.literal(e.left.value / e.right.value, core.numberType);
        if (e.op === "%")
          return core.literal(e.left.value % e.right.value, core.numberType);
        if (e.op === "**")
          return core.literal(e.left.value ** e.right.value, core.numberType);
      }
    }
    return e;
  },
  UnaryExpression(e) {
    e.operand = optimize(e.operand);
    if (e.operand.kind === "Literal" && typeof e.operand.value === "number") {
      if (e.op === "-") return core.literal(-e.operand.value, core.numberType);
    }
    return e;
  },
};
