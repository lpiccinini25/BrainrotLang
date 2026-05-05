#!/usr/bin/env node

import fs from "fs/promises";
import process from "process";
import compile from "./compiler.js";

const help = `Brainrot Compiler

Usage:
  brainrot <file> <outputType>

Output types:
  ast        Print the abstract syntax tree
  optimized  Print the optimized AST
  js         Generate JavaScript code
`;

async function main() {
  if (process.argv.length < 3) {
    console.log(help);
    return;
  }

  const filename = process.argv[2];
  const outputType = process.argv[3] || "ast";

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
