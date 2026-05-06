import * as core from "./core.js";

function error(message, at) {
  throw new Error(`${at.getLineAndColumnMessage()}${message}`);
}

function validate(condition, message, at) {
  if (!condition) error(message, at);
}

function validateBoolean(e, at) {
  validate(
    areCompatible(e.type, core.boolType),
    `Expected rizz (boolean), got ${typeName(e.type)}`,
    at,
  );
}

function validateNumber(e, at) {
  validate(
    areCompatible(e.type, core.numberType),
    `Expected sigma (number), got ${typeName(e.type)}`,
    at,
  );
}

function validateInteger(e, at) {
  validate(
    areCompatible(e.type, core.numberType) &&
      (e.value === undefined || Number.isInteger(e.value)),
    `Expected integer sigma, got ${typeName(e.type)}`,
    at,
  );
}

function areCompatible(t1, t2) {
  if (t1 === t2) return true;
  if (t1 === core.anyType || t2 === core.anyType) return true;
  if (t1?.kind === "ArrayType" && t2?.kind === "ArrayType") {
    return areCompatible(t1.baseType, t2.baseType);
  }
  if (t1?.kind === "OptionalType" && t2?.kind === "OptionalType") {
    return areCompatible(t1.baseType, t2.baseType);
  }
  if (t1?.kind === "FunctionType" && t2?.kind === "FunctionType") {
    return (
      t1.parameterTypes.length === t2.parameterTypes.length &&
      areCompatible(t1.returnType, t2.returnType) &&
      t1.parameterTypes.every((t, i) => areCompatible(t, t2.parameterTypes[i]))
    );
  }
  return false;
}

function typeName(t) {
  if (!t || t === core.voidType) return "void";
  if (typeof t === "string") return t;
  if (t.kind === "ArrayType") return `[${typeName(t.baseType)}]`;
  if (t.kind === "OptionalType") return `${typeName(t.baseType)}?`;
  if (t.kind === "FunctionType") {
    return `(${t.parameterTypes.map(typeName).join(",")}) -> ${typeName(
      t.returnType,
    )}`;
  }
  if (t.kind === "StructDeclaration") return t.name;
  if (t === core.numberType) return "sigma";
  if (t === core.boolType) return "rizz";
  if (t === core.stringType) return "string";
  /* istanbul ignore next */
  return t.kind || t.name || "unknown";
}

function validateAllHaveSameType(expressions, at) {
  validate(
    expressions.every((e) => areCompatible(e.type, expressions[0].type)),
    "All elements must have the same aura (type)",
    at,
  );
}

function validateIsFunction(e, at) {
  validate(
    e.type === "function" || e.type?.kind === "FunctionType",
    "Not a cook (function)",
    at,
  );
}

function validateNotReadOnly(e, at) {
  validate(!e.readOnly, `Cannot reassign to a locked_in variable, mid.`, at);
}

function validateArgumentsMatchParameters(args, targetType, at) {
  const paramTypes =
    targetType.kind === "FunctionType"
      ? targetType.parameterTypes
      : targetType.map((p) => p.type || p);

  validate(
    args.length === paramTypes.length,
    `${paramTypes.length} argument(s) expected but ${args.length} passed`,
    at,
  );
  args.forEach((arg, i) => {
    validate(
      areCompatible(arg.type, paramTypes[i]),
      `Cannot assign a ${typeName(arg.type)} to a ${typeName(paramTypes[i])}`,
      at,
    );
  });
}

function typeOf(node) {
  if (node.type) return node.type;
  if (node.kind === "IfStatement") return typeOf(node.consequent);
  /* istanbul ignore next */
  return core.anyType;
}

class Context {
  constructor(parent = null) {
    this.parent = parent;
    this.bindings = new Map();
    this.currentFunction = parent?.currentFunction || null;
  }
  set(name, entity, at) {
    validate(
      !this.bindings.has(name),
      `Identifier ${name} already locked in`,
      at,
    );
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
        core.binaryExp(
          variable,
          op.sourceString === "++" ? "+" : "-",
          core.literal(1, core.numberType),
          core.numberType,
        ),
      );
    },

    Statement_assign(target, _eq, source, _semi) {
      const t = target.translate();
      const s = source.translate();
      validateNotReadOnly(t, target.source);
      validate(
        areCompatible(s.type, t.type),
        `Cannot assign a ${typeName(s.type)} to a ${typeName(t.type)}`,
        target.source,
      );
      return core.assignment(t, s);
    },

    Statement_call(call, _semi) {
      return core.callStatement(call.translate());
    },

    Statement_break(_skedaddle, _semi) {
      return core.breakStatement();
    },

    Statement_return(_it_gave, exp, _semi) {
      const e = exp.translate();
      validate(
        areCompatible(e.type, context.currentFunction?.returnType),
        `Cannot assign a ${typeName(e.type)} to a ${typeName(
          context.currentFunction?.returnType,
        )}`,
        exp.source,
      );
      return core.returnStatement(e);
    },

    Statement_shortreturn(_it_gave, _semi) {
      validate(
        areCompatible(core.voidType, context.currentFunction?.returnType),
        `Expected a return value of type ${typeName(
          context.currentFunction?.returnType,
        )}`,
        _it_gave.source,
      );
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
      const paramEntities = params.translate();
      const resolvedReturnType =
        typeOpt.children.length > 0
          ? typeOpt.children[0].translate()
          : core.voidType;

      const fun = core.functionObject(name, paramEntities, resolvedReturnType);
      fun.type = core.functionType(
        paramEntities.map((p) => p.type),
        resolvedReturnType,
      );
      context.set(name, fun, id.source);

      const previousContext = context;
      context = new Context(context);
      context.currentFunction = fun;
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
        ret.translate(),
      );
    },

    Type_id(id) {
      const typeName = id.translate();
      const typeMap = {
        sigma: core.numberType,
        rizz: core.boolType,
        void: core.voidType,
      };
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
      const iteratorType = core.numberType;
      const iterator = core.variable(name, iteratorType);
      iterator.readOnly = true;
      context.set(name, iterator, id.source);
      const body = block.translate();
      context = previousContext;

      return core.forRangeStatement(
        iterator,
        lowExp,
        op.sourceString,
        highExp,
        body,
      );
    },

    LoopStmt_collection(_grind, id, _with, collection, block) {
      const collExp = collection.translate();
      validate(
        collExp.type?.kind === "ArrayType",
        "Expected an array",
        collection.source,
      );
      const name = id.translate();
      const previousContext = context;
      context = new Context(context);
      const iterator = core.variable(name, collExp.type.baseType);
      iterator.readOnly = true;
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
      validateAllHaveSameType(
        [consequentValue, alternateValue],
        consequent.source,
      );
      return core.conditional(
        testValue,
        consequentValue,
        alternateValue,
        consequentValue.type,
      );
    },

    Exp1_unwrapelse(left, _op, right) {
      const optionalValue = left.translate();
      const fallbackValue = right.translate();
      return core.binaryExp(
        optionalValue,
        "??",
        fallbackValue,
        fallbackValue.type,
      );
    },

    Exp2_or(left, _op, right) {
      const l = left.translate();
      const r = right.translate();
      validateBoolean(l, left.source);
      validateBoolean(r, right.source);
      return core.binaryExp(l, "||", r, core.boolType);
    },

    Exp2_and(left, _op, right) {
      const l = left.translate();
      const r = right.translate();
      validateBoolean(l, left.source);
      validateBoolean(r, right.source);
      return core.binaryExp(l, "&&", r, core.boolType);
    },

    Exp3_bitor(left, _op, right) {
      const l = left.translate();
      const r = right.translate();
      validateInteger(l, left.source);
      validateInteger(r, right.source);
      return core.binaryExp(l, "|", r, core.numberType);
    },

    Exp3_bitxor(left, _op, right) {
      const l = left.translate();
      const r = right.translate();
      validateInteger(l, left.source);
      validateInteger(r, right.source);
      return core.binaryExp(l, "^", r, core.numberType);
    },

    Exp3_bitand(left, _op, right) {
      const l = left.translate();
      const r = right.translate();
      validateInteger(l, left.source);
      validateInteger(r, right.source);
      return core.binaryExp(l, "&", r, core.numberType);
    },

    Exp4_compare(left, op, right) {
      const l = left.translate();
      const r = right.translate();
      const operator = op.sourceString;
      if (operator === "==" || operator === "!=") {
        validate(
          areCompatible(l.type, r.type),
          "Types must match for comparison",
          op.source,
        );
      } else {
        validateNumber(l, left.source);
        validateNumber(r, right.source);
      }
      return core.binaryExp(l, operator, r, core.boolType);
    },

    Exp5_shift(left, op, right) {
      const l = left.translate();
      const r = right.translate();
      validateInteger(l, left.source);
      validateInteger(r, right.source);
      return core.binaryExp(l, op.sourceString, r, core.numberType);
    },

    Exp6_add(left, op, right) {
      const l = left.translate();
      const r = right.translate();
      const operator = op.sourceString;
      if (
        operator === "+" &&
        (l.type === core.stringType || r.type === core.stringType)
      ) {
        return core.binaryExp(l, operator, r, core.stringType);
      }
      validateNumber(l, left.source);
      validateNumber(r, right.source);
      return core.binaryExp(l, operator, r, core.numberType);
    },

    Exp7_multiply(left, op, right) {
      const l = left.translate();
      const r = right.translate();
      const operator =
        op.sourceString === "fanum_tax"
          ? "*"
          : op.sourceString === "mog"
            ? "/"
            : "%";
      validateNumber(l, left.source);
      validateNumber(r, right.source);
      return core.binaryExp(l, operator, r, core.numberType);
    },

    Exp8_power(left, _op, right) {
      const l = left.translate();
      const r = right.translate();
      validateNumber(l, left.source);
      validateNumber(r, right.source);
      return core.binaryExp(l, "**", r, core.numberType);
    },

    Exp8_unary(op, operand) {
      const opValue = operand.translate();
      const operator = op.sourceString;
      if (operator === "-") {
        validateNumber(opValue, op.source);
        return core.unaryExp(operator, opValue, opValue.type);
      }
      if (operator === "#") {
        validate(
          opValue.type?.kind === "ArrayType" ||
            opValue.type === core.stringType,
          "Expected an array or string",
          op.source,
        );
        return core.unaryExp(operator, opValue, core.numberType);
      }
      if (operator === "random") {
        validateNumber(opValue, op.source);
        return core.unaryExp(operator, opValue, core.numberType);
      }
      if (operator === "some") {
        return core.unaryExp(
          operator,
          opValue,
          core.optionalType(opValue.type),
        );
      }
      // Must be "!"
      validateBoolean(opValue, op.source);
      return core.unaryExp(operator, opValue, core.boolType);
    },

    Primary_emptyopt(_mid, type) {
      return core.literal(null, core.optionalType(type.translate()));
    },

    Primary_spawn(_spawn, id, _open, args, _close) {
      const aura = context.get(id.sourceString, id.source);
      validate(
        aura.kind === "StructDeclaration",
        `Identifier ${id.sourceString} is not an aura`,
        id.source,
      );
      const argValues = args.asIteration().children.map((a) => a.translate());
      validateArgumentsMatchParameters(argValues, aura.fields, args.source);
      const call = core.constructorCall(aura, argValues);
      call.type = aura;
      return call;
    },

    Primary_call(callee, _open, args, _close) {
      const func = callee.translate();
      validateIsFunction(func, callee.source);
      const argValues = args.asIteration().children.map((a) => a.translate());
      const targetType = func.type?.kind === "FunctionType" ? func.type : func;
      validateArgumentsMatchParameters(argValues, targetType, args.source);
      const call = core.call(func, argValues);
      call.type = targetType.returnType;
      return call;
    },

    Primary_subscript(array, _open, index, _close) {
      const arrayExp = array.translate();
      validate(
        arrayExp.type?.kind === "ArrayType",
        "Expected an array",
        array.source,
      );
      const subscript = core.subscript(arrayExp, index.translate());
      subscript.type = arrayExp.type.baseType;
      return subscript;
    },

    Primary_member(object, op, id) {
      const objExp = object.translate();
      const fieldName = id.translate();
      const type =
        objExp.type?.kind === "OptionalType"
          ? objExp.type.baseType
          : objExp.type;
      validate(type?.fields, "Not a struct", object.source);
      const field = type.fields.find((f) => f.name === fieldName);
      validate(field, `No such field: ${fieldName}`, id.source);
      const member = core.member(objExp, op.sourceString, field);
      member.type = field.type;
      return member;
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
      return core.literal(parseInt(this.sourceString), core.numberType);
    },

    floatlit(_whole, _dot, _fraction, _e, _sign, _exponent) {
      return core.literal(parseFloat(this.sourceString), core.numberType);
    },

    stringlit(_open, _chars, _close) {
      return core.literal(this.sourceString.slice(1, -1), core.stringType);
    },

    id(_first, _rest) {
      return this.sourceString;
    },
  };

  return grammar
    .createSemantics()
    .addOperation("translate", actions)(match)
    .translate();
}
