#!/usr/bin/env node

import {readFileSync} from "fs";
import {join as joinPath} from "path";
import runAll from "./index";

if (require.main === module) {
  main(process.argv.slice(2));
}

function printHelp() {
  console.log(`
Usage: npm-run-all [OPTIONS] <task> [...tasks]

  Run specified tasks on sequential.

  Options:
    -h, --help                        Print this text.
    -p, --parallel <task> [...tasks]  Run specified tasks on parallel.
    -v, --version                     Print version number.

  See Also:
    https://github.com/mysticatea/npm-run-all
`);
}

function printVersion() {
  const version = JSON.parse(
    readFileSync(
      joinPath(__dirname, "../package.json"),
      {encoding: "utf8"}
    )
  ).version;

  console.log("v" + version);
}

function findParallelOptionIndex(args) {
  for (let i = 0, end = args.length; i < end; ++i) {
    const arg = args[i];
    if (arg === "-p" || arg === "--parallel") {
      return i;
    }
  }
  return -1;
}

/*eslint no-process-exit:0*/
function main(args) {
  switch (args[0]) {
    case undefined:
    case "-h":
    case "--help":
      printHelp();
      process.exit(0);
      break;

    case "-v":
    case "--version":
      printVersion();
      process.exit(0);
      break;
  }

  const pIndex = findParallelOptionIndex(args);
  const seqTasks = (pIndex < 0 ? args : args.slice(0, pIndex));
  const parTasks = (pIndex < 0 ? [] : args.slice(1 + pIndex));
  const seqOptions =
    {stdout: process.stdout, stderr: process.stderr, parallel: false};
  const parOptions =
    {stdout: process.stdout, stderr: process.stderr, parallel: true};

  runAll(seqTasks, seqOptions)
    .then(() => runAll(parTasks, parOptions))
    .catch(() => process.exit(1));
}
