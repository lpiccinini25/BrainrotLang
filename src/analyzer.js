import * as core from "./core.js";

function error(message, at) {
  throw new Error(`${at.getLineAndColumnMessage()}${message}`);
}

function validate(condition, message, at) {
  if (!condition) error(message, at);
}

function validateBoolean(e, at) {
  validate(e.type === core.boolType, "Expected rizz (boolean)", at);
}

function validateNumber(e, at) {
  validate(
    e.type === core.numberType || e.type === core.intType || e.type === core.floatType,
    "Expected sigma (number)",
    at
  );
}

function validateInteger(e, at) {
  validate(
    e.type === core.intType || (e.type === core.numberType && (e.value === undefined || Number.isInteger(e.value))),
    "Expected an integer",
    at
  );
}

function validateAllHaveSameType(expressions, at) {
  validate(
    expressions.every((e) => e.type === expressions[0].type),
    "All elements must have the same aura (type)",
    at
  );
}

function validateIsFunction(e, at) {
  validate(e.type === "function", "Not a cook (function)", at);
}

function validateNotReadOnly(e, at) {
  validate(!e.readOnly, `Cannot reassign to a locked_in variable, mid.`, at);
}

function validateArgumentsMatchParameters(args, params, at) {
  validate(
    args.length === params.length,
    `${params.length} argument(s) expected but ${args.length} passed`,
    at
  );
  args.forEach((arg, i) => {
    const argType = arg.type;
    const paramType = params[i].type;
    const compatible =
      argType === paramType ||
      ((argType === core.intType || argType === core.floatType) && paramType === core.numberType) ||
      (argType === core.numberType && (paramType === core.intType || paramType === core.floatType));
    validate(
      compatible,
      `Cannot assign a ${argType.kind} to a ${paramType.kind}`,
      at
    );
  });
}

function typeOf(node) {
  if (node.type) return node.type;
  if (node.kind === "IfStatement") return typeOf(node.consequent);
  return core.anyType;
}

class Context {
  constructor(parent = null) {
    this.parent = parent;
    this.bindings = new Map();
  }
  set(name, entity, at) {
    validate(!this.bindings.has(name), `Identifier ${name} already locked in`, at);
    this.bindings.set(name, entity);
    return entity;
  }
  get(name, at) {
    const entity = this.bindings.get(name) || this.parent?.get(name, at);
    validate(entity, `Identifier ${name} not declared, mid.`, at);
    return entity;
  }
}

export default function translate(match) {
  const grammar = match.matcher.grammar;
  let context = new Context();

  const actions = {
    Program(statements) {
      return core.program(statements.children.map((s) => s.translate()));
    },

    Statement_let(s, _semi) {
      return s.translate();
    },

    Statement_print(s, _semi) {
      return s.translate();
    },

    LetStmt(modifier, id, _eq, expression) {
      const name = id.translate();
      const initializer = expression.translate();
      const readOnly = modifier.sourceString === "locked_in";
      const inferredType = typeOf(initializer);
      const variable = core.variable(name, inferredType);
      variable.readOnly = readOnly;
      context.set(name, variable, id.source);
      const decl = core.variableDeclaration(name, initializer, readOnly);
      decl.type = inferredType;
      return decl;
    },

    PrintStmt(_yap, _open, expression, _close) {
      return core.printStmt(expression.translate());
    },

    Statement_bump(exp, op, _semi) {
      const variable = exp.translate();
      validateNumber(variable, exp.source);
      validateNotReadOnly(variable, exp.source);
      return core.assignment(
        variable,
        core.binaryExp(variable, op.sourceString === "++" ? "+" : "-", core.literal(1, core.intType), core.numberType)
      );
    },

    Statement_assign(target, _eq, source, _semi) {
      const t = target.translate();
      validateNotReadOnly(t, target.source);
      return core.assignment(t, source.translate());
    },

    Statement_call(call, _semi) {
      return core.callStatement(call.translate());
    },

    Statement_break(_skedaddle, _semi) {
      return core.breakStatement();
    },

    Statement_return(_it_gave, exp, _semi) {
      return core.returnStatement(exp.translate());
    },

    Statement_shortreturn(_it_gave, _semi) {
      return core.shortReturnStatement();
    },

    TypeDecl(_aura, id, _open, fields, _close) {
      const name = id.translate();
      const entity = core.structDeclaration(name, []);
      context.set(name, entity, id.source);
      entity.fields = fields.asIteration().children.map((f) => {
        const binding = f.translate();
        return core.field(binding.name, binding.type);
      });
      return entity;
    },

    Field(binding) {
      return binding.translate();
    },

    FunDecl(_cook, id, params, _colon, typeOpt, block) {
      const name = id.translate();
      const returnTypeName = typeOpt.sourceString.replace(/^:\s*/, "") || "void";
      const typeMap = { sigma: core.numberType, rizz: core.boolType, int: core.intType, float: core.floatType };
      const resolvedReturnType = typeMap[returnTypeName] ?? returnTypeName;
      const paramEntities = params.translate();

      const fun = core.functionObject(name, paramEntities, resolvedReturnType);
      context.set(name, fun, id.source);

      const previousContext = context;
      context = new Context(context);
      for (const p of paramEntities) {
        context.set(p.name, p, id.source);
      }
      const body = block.translate();
      context = previousContext;

      return core.functionDeclaration(fun, body);
    },

    Params(_open, paramList, _close) {
      return paramList.asIteration().children.map((p) => p.translate());
    },

    Param(binding) {
      const b = binding.translate();
      return core.parameter(b.name, b.type);
    },

    Binding(id, _colon, type) {
      return { name: id.translate(), type: type.translate() };
    },

    Type_optional(base, _qmark) {
      return core.optionalType(base.translate());
    },

    Type_array(_open, base, _close) {
      return core.arrayType(base.translate());
    },

    Type_function(_open, params, _close, _arrow, ret) {
      return core.functionType(
        params.asIteration().children.map((p) => p.translate()),
        ret.translate()
      );
    },

    Type_id(id) {
      const typeName = id.translate();
      const typeMap = { sigma: core.numberType, rizz: core.boolType, int: core.intType, float: core.floatType };
      if (typeMap[typeName]) return typeMap[typeName];
      return context.get(typeName, id.source);
    },

    IfStmt_long(_vibe_check, test, block1, _caught_lackin, block2) {
      const testExp = test.translate();
      validateBoolean(testExp, test.source);
      return core.ifStatement(testExp, block1.translate(), block2.translate());
    },

    IfStmt_elsif(_vibe_check, test, block, _caught_lackin, next) {
      const testExp = test.translate();
      validateBoolean(testExp, test.source);
      return core.ifStatement(testExp, block.translate(), next.translate());
    },

    IfStmt_short(_vibe_check, test, block) {
      const testExp = test.translate();
      validateBoolean(testExp, test.source);
      return core.ifStatement(testExp, block.translate(), null);
    },

    LoopStmt_while(_go_go_go, test, block) {
      const testExp = test.translate();
      validateBoolean(testExp, test.source);
      return core.whileStatement(testExp, block.translate());
    },

    LoopStmt_repeat(_run_it_back, count, block) {
      const countExp = count.translate();
      validateNumber(countExp, count.source);
      return core.repeatStatement(countExp, block.translate());
    },

    LoopStmt_range(_grind, id, _with, low, op, high, block) {
      const name = id.translate();
      const lowExp = low.translate();
      const highExp = high.translate();
      validateNumber(lowExp, low.source);
      validateNumber(highExp, high.source);

      const previousContext = context;
      context = new Context(context);
      const iterator = core.variableDeclaration(name, lowExp, true);
      context.set(name, iterator, id.source);
      const body = block.translate();
      context = previousContext;

      return core.forRangeStatement(iterator, lowExp, op.sourceString, highExp, body);
    },

    LoopStmt_collection(_grind, id, _with, collection, block) {
      const name = id.translate();
      const collExp = collection.translate();

      const previousContext = context;
      context = new Context(context);
      const iterator = core.variableDeclaration(name, null, true);
      context.set(name, iterator, id.source);
      const body = block.translate();
      context = previousContext;

      return core.forCollectionStatement(iterator, collExp, body);
    },

    Block(_open, statements, _close) {
      const previousContext = context;
      context = new Context(context);
      const stmts = statements.children.map((s) => s.translate());
      context = previousContext;
      return stmts;
    },

    Exp_conditional(test, _q, consequent, _c, alternate) {
      const testValue = test.translate();
      const consequentValue = consequent.translate();
      const alternateValue = alternate.translate();
      validateBoolean(testValue, test.source);
      validateAllHaveSameType([consequentValue, alternateValue], consequent.source);
      return core.ifStatement(testValue, consequentValue, alternateValue);
    },

    Exp1_unwrapelse(left, _op, right) {
      const optionalValue = left.translate();
      const fallbackValue = right.translate();
      return core.binaryExp(optionalValue, "??", fallbackValue, fallbackValue.type);
    },

    Exp2_or(left, _op, right) {
      const leftOperand = left.translate();
      const rightOperand = right.translate();
      validateBoolean(leftOperand, left.source);
      validateBoolean(rightOperand, right.source);
      return core.binaryExp(leftOperand, "||", rightOperand, core.boolType);
    },

    Exp2_and(left, _op, right) {
      const leftOperand = left.translate();
      const rightOperand = right.translate();
      validateBoolean(leftOperand, left.source);
      validateBoolean(rightOperand, right.source);
      return core.binaryExp(leftOperand, "&&", rightOperand, core.boolType);
    },

    Exp3_bitor(left, _op, right) {
      const leftOperand = left.translate();
      const rightOperand = right.translate();
      validateInteger(leftOperand, left.source);
      validateInteger(rightOperand, right.source);
      return core.binaryExp(leftOperand, "|", rightOperand, core.intType);
    },

    Exp3_bitxor(left, _op, right) {
      const leftOperand = left.translate();
      const rightOperand = right.translate();
      validateInteger(leftOperand, left.source);
      validateInteger(rightOperand, right.source);
      return core.binaryExp(leftOperand, "^", rightOperand, core.intType);
    },

    Exp3_bitand(left, _op, right) {
      const leftOperand = left.translate();
      const rightOperand = right.translate();
      validateInteger(leftOperand, left.source);
      validateInteger(rightOperand, right.source);
      return core.binaryExp(leftOperand, "&", rightOperand, core.intType);
    },

    Exp4_compare(left, op, right) {
      const leftOperand = left.translate();
      const rightOperand = right.translate();
      return core.binaryExp(leftOperand, op.sourceString, rightOperand, core.boolType);
    },

    Exp5_shift(left, op, right) {
      const leftOperand = left.translate();
      const rightOperand = right.translate();
      validateInteger(leftOperand, left.source);
      validateInteger(rightOperand, right.source);
      return core.binaryExp(leftOperand, op.sourceString, rightOperand, core.intType);
    },

    Exp6_add(left, op, right) {
      const leftOperand = left.translate();
      const rightOperand = right.translate();
      return core.binaryExp(leftOperand, op.sourceString, rightOperand, core.numberType);
    },

    Exp7_multiply(left, op, right) {
      const leftOperand = left.translate();
      const rightOperand = right.translate();
      const operator = op.sourceString === "fanum_tax" ? "*" : op.sourceString === "mog" ? "/" : "%";
      return core.binaryExp(leftOperand, operator, rightOperand, core.numberType);
    },

    Exp8_power(left, _op, right) {
      const baseValue = left.translate();
      const exponentValue = right.translate();
      return core.binaryExp(baseValue, "**", exponentValue, core.numberType);
    },

    Exp8_unary(op, operand) {
      const opValue = operand.translate();
      const operator = op.sourceString;
      if (operator === "-" || operator === "#" || operator === "random") {
        return core.unaryExp(operator, opValue, core.numberType);
      }
      return core.unaryExp(operator, opValue, core.boolType);
    },

    Primary_emptyopt(_mid, type) {
      return core.literal(null, type.translate());
    },

    Primary_spawn(_spawn, id, _open, args, _close) {
      const aura = context.get(id.sourceString, id.source);
      validate(aura.kind === "StructDeclaration", `Identifier ${id.sourceString} is not an aura`, id.source);
      const argValues = args.asIteration().children.map((a) => a.translate());
      validateArgumentsMatchParameters(argValues, aura.fields, args.source);
      return core.constructorCall(aura, argValues);
    },

    Primary_call(callee, _open, args, _close) {
      const func = callee.translate();
      validateIsFunction(func, callee.source);
      const argValues = args.asIteration().children.map((a) => a.translate());
      validateArgumentsMatchParameters(argValues, func.params, args.source);
      return core.call(func, argValues);
    },

    Primary_subscript(array, _open, index, _close) {
      const arrayExp = array.translate();
      return core.subscript(arrayExp, index.translate());
    },

    Primary_member(object, op, id) {
      const objExp = object.translate();
      return core.member(objExp, op.sourceString, id.translate());
    },

    Primary_id(id) {
      return context.get(id.translate(), id.source);
    },

    Primary_emptyarray(type, _open, _close) {
      return core.literal([], type.translate());
    },

    Primary_arrayexp(_open, elements, _close) {
      const items = elements.asIteration().children.map((e) => e.translate());
      const baseType = items.length > 0 ? items[0].type : core.anyType;
      return core.literal(items, core.arrayType(baseType));
    },

    Primary_parens(_open, exp, _close) {
      return exp.translate();
    },

    no_cap(_) {
      return core.literal(true, core.boolType);
    },

    cap(_) {
      return core.literal(false, core.boolType);
    },

    intlit(_) {
      return core.literal(parseInt(this.sourceString), core.intType);
    },

    floatlit(_whole, _dot, _fraction, _e, _sign, _exponent) {
      return core.literal(parseFloat(this.sourceString), core.floatType);
    },

    stringlit(_open, _chars, _close) {
      return core.literal(this.sourceString.slice(1, -1), core.stringType);
    },

    id(_first, _rest) {
      return this.sourceString;
    },
  };

  return grammar.createSemantics().addOperation("translate", actions)(match).translate();
}
