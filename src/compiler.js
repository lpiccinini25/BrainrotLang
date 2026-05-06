import parse from "./parser.js";
import translate from "./analyzer.js";
import optimize from "./optimizer.js";
import generate from "./generator.js";

export default function compile(source, outputType) {
  const match = parse(source);
  if (outputType === "match") return match;
  const analyzed = translate(match);
  if (outputType === "ast" || outputType === "analyzed") return analyzed;
  if (!outputType) return analyzed; // Default to analyzed AST for tests

  const optimized = optimize(analyzed);
  if (outputType === "optimized") return optimized;
  if (outputType === "js") return generate(optimized);
  return generate(optimized);
}
