import parse from "./parser.js";
import translate from "./analyzer.js";
import optimize from "./optimizer.js";
import generate from "./generator.js";

export default function compile(source, outputType = "ast") {
  const match = parse(source);
  const ast = translate(match);
  if (outputType === "ast") return ast;
  const optimized = optimize(ast);
  if (outputType === "optimized") return optimized;
  return generate(optimized);
}
