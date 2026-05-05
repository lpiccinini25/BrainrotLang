import * as fs from "fs";
import * as ohm from "ohm-js";

const grammar = ohm.grammar(fs.readFileSync("src/brainrot.ohm"));

export default function parse(source) {
  const match = grammar.match(source);
  if (match.failed()) {
    throw new Error(match.message);
  }
  return match;
}
