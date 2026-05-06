import * as ohm from "ohm-js";

// ==========================================================
// 1. ABSTRACT SYNTAX TREE (AST) CLASSES
// ==========================================================
class Program {
  constructor(statements) {
    this.statements = statements;
  }
}
class VariableDeclaration {
  constructor(modifier, id, initializer) {
    this.modifier = modifier; // "let" or "const"
    this.id = id;
    this.initializer = initializer;
  }
}
class StructDeclaration {
  constructor(id, fields) {
    Object.assign(this, { id, fields });
  }
}
class Field {
  constructor(id, type) {
    Object.assign(this, { id, type });
  }
}
class FunctionDeclaration {
  constructor(id, params, returnType, body) {
    Object.assign(this, { id, params, returnType, body });
  }
}
class Parameter {
  constructor(id, type) {
    Object.assign(this, { id, type });
  }
}
class TypeNode {
  // Can represent simple types, arrays, optionals, or functions depending on properties
  constructor(description) {
    Object.assign(this, description);
  }
}
class Assignment {
  constructor(target, source) {
    Object.assign(this, { target, source });
  }
}
class CallStatement {
  constructor(callExp) {
    this.callExp = callExp;
  }
}
class ReturnStatement {
  constructor(expression) {
    this.expression = expression;
  } // null if short return
}
class IfStatement {
  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate });
  }
}
class WhileStatement {
  constructor(test, body) {
    Object.assign(this, { test, body });
  }
}
class BinaryExpression {
  constructor(op, left, right) {
    Object.assign(this, { op, left, right });
  }
}
class UnaryExpression {
  constructor(op, operand) {
    Object.assign(this, { op, operand });
  }
}
class CallExpression {
  constructor(callee, args) {
    Object.assign(this, { callee, args });
  }
}
class SubscriptExpression {
  constructor(array, index) {
    Object.assign(this, { array, index });
  }
}
class MemberExpression {
  constructor(object, isOptional, field) {
    Object.assign(this, { object, isOptional, field });
  }
}
class Literal {
  constructor(type, value) {
    Object.assign(this, { type, value });
  }
}
class Identifier {
  constructor(name) {
    this.name = name;
  }
}

// ==========================================================
// 2. OHM GRAMMAR (Paste your grammar string here)
// ==========================================================
const carlosGrammar = ohm.grammar(`
  Carlos {
    Program     = Statement+
    Statement   = VarDecl
                | TypeDecl
                | FunDecl
                | Exp9 ("++" | "--") ";"                        --bump
                | Exp9 "=" Exp ";"                              --assign
                | Exp9_call ";"                                 --call
                | break ";"                                     --break
                | return Exp ";"                                --return
                | return ";"                                    --shortreturn
                | IfStmt
                | LoopStmt

    VarDecl     = (let | const) id "=" Exp ";"
    TypeDecl    = struct id "{" Field* "}"
    Field       = id ":" Type
    FunDecl     = function id Params (":" Type)? Block
    Params      = "(" ListOf<Param, ","> ")"
    Param       = id ":" Type

    Type        = Type "?"                                      --optional
                | "[" Type "]"                                  --array
                | "(" ListOf<Type, ","> ")" "->" Type           --function
                | id                                            --id

    IfStmt      = if Exp Block else Block                       --long
                | if Exp Block else IfStmt                      --elsif
                | if Exp Block                                  --short
    LoopStmt    = while Exp Block                               --while
                | repeat Exp Block                              --repeat
                | for id in Exp ("..." | "..<") Exp Block       --range
                | for id in Exp Block                           --collection
    Block       = "{" Statement* "}"

    Exp         = Exp1 "?" Exp1 ":" Exp                         --conditional
                | Exp1
    Exp1        = Exp1 "??" Exp2                                --unwrapelse
                | Exp2
    Exp2        = Exp3 ("||" Exp3)+                             --or
                | Exp3 ("&&" Exp3)+                             --and
                | Exp3
    Exp3        = Exp4 ("|" Exp4)+                              --bitor
                | Exp4 ("^" Exp4)+                              --bitxor
                | Exp4 ("&" Exp4)+                              --bitand
                | Exp4
    Exp4        = Exp5 ("<="|"<"|"=="|"!="|">="|">") Exp5       --compare
                | Exp5
    Exp5        = Exp5 ("<<" | ">>") Exp6                       --shift
                | Exp6
    Exp6        = Exp6 ("+" | "-") Exp7                         --add
                | Exp7
    Exp7        = Exp7 ("*"| "/" | "%") Exp8                    --multiply
                | Exp8
    Exp8        = Exp9 "**" Exp8                                --power
                | Exp9
                | ("#" | "-" | "!" | some | random) Exp9        --unary
    Exp9        = true ~mut
                | false ~mut
                | floatlit ~mut
                | intlit ~mut
                | no Type ~mut                                  --emptyopt
                | Exp9 "(" ListOf<Exp, ","> ")" ~mut            --call
                | Exp9 "[" Exp "]"                              --subscript
                | Exp9 ("." | "?.") id                          --member
                | stringlit ~mut
                | id                                            --id
                | Type_array "(" ")" ~mut                       --emptyarray
                | "[" NonemptyListOf<Exp, ","> "]" ~mut         --arrayexp
                | "(" Exp ")" ~mut                              --parens

    intlit      = digit+
    floatlit    = digit+ "." digit+ (("E" | "e") ("+" | "-")? digit+)?
    stringlit   = "\\"" char* "\\""
    char        = ~control ~"\\\\" ~"\\"" any
                | "\\\\" ("n" | "t" | "\\"" | "\\\\")                --escape
                | "\\\\u{" hex hex? hex? hex? hex? hex? "}"       --codepoint
    control     = "\\x00".."\\x1f" | "\\x80".."\\x9f"
    hex         = hexDigit
    mut         = ~"==" "=" | "++" | "--"

    let         = "let" ~alnum
    const       = "const" ~alnum
    struct      = "struct" ~alnum
    function    = "function" ~alnum
    if          = "if" ~alnum
    else        = "else" ~alnum
    while       = "while" ~alnum
    repeat      = "repeat" ~alnum
    for         = "for" ~alnum
    in          = "in" ~alnum
    random      = "random" ~alnum
    break       = "break" ~alnum
    return      = "return" ~alnum
    some        = "some" ~alnum
    no          = "no" ~alnum
    true        = "true" ~alnum
    false       = "false" ~alnum
    keyword     = let | const | struct | function | if | else | while | repeat
                | for | in | break | return | some | no | random | true | false
    id          = ~keyword letter alnum*

    space      += "//" (~"\\n" any)* --comment
  }
`);

// ==========================================================
// 3. CST to AST TRANSLATION (Ohm Semantics)
// ==========================================================
const semantics = carlosGrammar.createSemantics();

// Utility for unpacking Ohm lists
const unpack = (list) => list.asIteration().children.map((c) => c.ast());

semantics.addOperation("ast()", {
  Program(statements) {
    return new Program(statements.children.map((s) => s.ast()));
  },

  // Declarations
  VarDecl(modifier, id, _eq, exp, _semi) {
    return new VariableDeclaration(
      modifier.sourceString,
      id.sourceString,
      exp.ast(),
    );
  },
  TypeDecl(_struct, id, _open, fields, _close) {
    return new StructDeclaration(
      id.sourceString,
      fields.children.map((f) => f.ast()),
    );
  },
  Field(id, _colon, type) {
    return new Field(id.sourceString, type.ast());
  },
  FunDecl(_fn, id, params, _colon, typeOpt, block) {
    const returnType =
      typeOpt.children.length > 0
        ? typeOpt.children[0].ast()
        : new TypeNode({ kind: "void" });
    return new FunctionDeclaration(
      id.sourceString,
      params.ast(),
      returnType,
      block.ast(),
    );
  },
  Params(_open, paramList, _close) {
    return unpack(paramList);
  },
  Param(id, _colon, type) {
    return new Parameter(id.sourceString, type.ast());
  },

  // Types
  Type_optional(type, _qmark) {
    return new TypeNode({ kind: "optional", base: type.ast() });
  },
  Type_array(_open, type, _close) {
    return new TypeNode({ kind: "array", base: type.ast() });
  },
  Type_function(_open, paramTypes, _close, _arrow, returnType) {
    return new TypeNode({
      kind: "function",
      params: unpack(paramTypes),
      returns: returnType.ast(),
    });
  },
  Type_id(id) {
    return new TypeNode({ kind: "named", name: id.sourceString });
  },

  // Statements
  Statement_assign(target, _eq, source, _semi) {
    return new Assignment(target.ast(), source.ast());
  },
  Statement_call(callExp, _semi) {
    return new CallStatement(callExp.ast());
  },
  Statement_return(_return, exp, _semi) {
    return new ReturnStatement(exp.ast());
  },
  Statement_shortreturn(_return, _semi) {
    return new ReturnStatement(null);
  },
  Block(_open, statements, _close) {
    return statements.children.map((s) => s.ast());
  },

  IfStmt_long(_if, test, block1, _else, block2) {
    return new IfStatement(test.ast(), block1.ast(), block2.ast());
  },
  IfStmt_short(_if, test, block) {
    return new IfStatement(test.ast(), block.ast(), null);
  },
  LoopStmt_while(_while, test, block) {
    return new WhileStatement(test.ast(), block.ast());
  },

  // Expressions (Binary & Unary Ops)
  Exp4_compare(left, op, right) {
    return new BinaryExpression(op.sourceString, left.ast(), right.ast());
  },
  Exp6_add(left, op, right) {
    return new BinaryExpression(op.sourceString, left.ast(), right.ast());
  },
  Exp7_multiply(left, op, right) {
    return new BinaryExpression(op.sourceString, left.ast(), right.ast());
  },
  Exp8_unary(op, operand) {
    return new UnaryExpression(op.sourceString, operand.ast());
  },

  Exp9_call(callee, _open, args, _close) {
    return new CallExpression(callee.ast(), unpack(args));
  },
  Exp9_subscript(array, _open, index, _close) {
    return new SubscriptExpression(array.ast(), index.ast());
  },
  Exp9_member(object, op, id) {
    return new MemberExpression(
      object.ast(),
      op.sourceString === "?.",
      id.sourceString,
    );
  },
  Exp9_parens(_open, exp, _close) {
    return exp.ast();
  },

  // Literals and Identifiers
  true(_) {
    return new Literal("boolean", true);
  },
  false(_) {
    return new Literal("boolean", false);
  },
  intlit(_) {
    return new Literal("int", parseInt(this.sourceString, 10));
  },
  floatlit(_1, _2, _3, _4, _5, _6) {
    return new Literal("float", parseFloat(this.sourceString));
  },
  stringlit(_open, chars, _close) {
    return new Literal("string", this.sourceString.slice(1, -1));
  },
  id(_first, _rest) {
    return new Identifier(this.sourceString);
  },
});

// ==========================================================
// 4. PARSER FUNCTION
// ==========================================================
export default function parse(sourceCode) {
  const match = carlosGrammar.match(sourceCode);
  if (!match.succeeded()) {
    throw new Error(match.message);
  }
  return semantics(match).ast();
}

// ----------------------------------------------------------
// Quick Test Run
// ----------------------------------------------------------
const testCode = `
  const languageName = "Carlos";
  
  function greeting(): string {
    return "Welcome";
  }

  repeat 5 {
    print(greeting() + " " + languageName);
  }
`;

try {
  const ast = parse(testCode);
  console.log(JSON.stringify(ast, null, 2));
} catch (e) {
  console.error("Syntax Error:", e.message);
}
