export function program(statements) {
  return { kind: "Program", statements };
}

export function variable(name, type) {
  return { kind: "Variable", name, type };
}

export function printStmt(expression) {
  return { kind: "PrintStatement", expression };
}

export function variableDeclaration(name, initializer, readOnly) {
  return { kind: "VariableDeclaration", name, initializer, readOnly };
}

export function structDeclaration(name, fields) {
  return { kind: "StructDeclaration", name, fields };
}

export function field(name, type) {
  return { kind: "Field", name, type };
}

export function functionObject(name, params, returnType) {
  return { kind: "FunctionObject", name, params, returnType, type: "function" };
}

export function functionDeclaration(fun, body) {
  return { kind: "FunctionDeclaration", fun, body };
}

export function parameter(name, type) {
  return { kind: "Parameter", name, type };
}

export function arrayType(baseType) {
  return { kind: "ArrayType", baseType };
}

export function optionalType(baseType) {
  return { kind: "OptionalType", baseType };
}

export function functionType(parameterTypes, returnType) {
  return { kind: "FunctionType", parameterTypes, returnType };
}

export function type(name) {
  return { kind: "Type", name };
}

export function constructorCall(aura, args) {
  return { kind: "ConstructorCall", aura, args };
}

export function assignment(target, source) {
  return { kind: "Assignment", target, source };
}

export function callStatement(call) {
  return { kind: "CallStatement", call };
}

export function returnStatement(expression) {
  return { kind: "ReturnStatement", expression };
}

export function shortReturnStatement() {
  return { kind: "ShortReturnStatement" };
}

export function breakStatement() {
  return { kind: "BreakStatement" };
}

export function ifStatement(test, consequent, alternate) {
  return { kind: "IfStatement", test, consequent, alternate };
}

export function whileStatement(test, body) {
  return { kind: "WhileStatement", test, body };
}

export function repeatStatement(count, body) {
  return { kind: "RepeatStatement", count, body };
}

export function forRangeStatement(iterator, low, op, high, body) {
  return { kind: "ForRangeStatement", iterator, low, op, high, body };
}

export function forCollectionStatement(iterator, collection, body) {
  return { kind: "ForCollectionStatement", iterator, collection, body };
}

export function conditional(test, consequent, alternate, type) {
  return { kind: "ConditionalExpression", test, consequent, alternate, type };
}

export function binaryExp(left, op, right, type) {
  return { kind: "BinaryExpression", left, op, right, type };
}

export function unaryExp(op, operand, type) {
  return { kind: "UnaryExpression", op, operand, type };
}

export function call(callee, args) {
  return { kind: "CallExpression", callee, args };
}

export function subscript(array, index) {
  return { kind: "SubscriptExpression", array, index };
}

export function member(object, op, field) {
  return { kind: "MemberExpression", object, op, field };
}

export function literal(value, type) {
  return { kind: "Literal", value, type };
}

// Some built-in types might be useful
export const numberType = { kind: "NumberType" };
export const intType = { kind: "IntType" };
export const floatType = { kind: "FloatType" };
export const stringType = { kind: "StringType" };
export const boolType = { kind: "BoolType" };
export const voidType = { kind: "VoidType" };
export const anyType = { kind: "AnyType" };
