#!/usr/bin/env node

import fs from "fs/promises";
import process from "process";
import compile from "./compiler.js";

const help = `Brainrot Compiler

Usage:
  brainrot <file> <outputType>

Output types:
  syntax     Check for syntax errors and stop
  parse      Print the raw Ohm match object
  analyze    Check syntax and semantics, then print analyzed AST
  optimized  Perform constant folding and print optimized AST
  js         Generate and print JavaScript code
`;

async function main() {
  if (process.argv.length < 3) {
    console.log(help);
    return;
  }

  const filename = process.argv[2];
  const outputType = process.argv[3] || "analyze";

  try {
    const source = await fs.readFile(filename, "utf8");
    const result = compile(source, outputType);
    if (typeof result === "string") {
      console.log(result);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (e) {
    console.error(`\x1b[31mError:\x1b[0m ${e.message}`);
    process.exit(1);
  }
}

main();
