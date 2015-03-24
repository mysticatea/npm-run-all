#!/usr/bin/env node

import {readFileSync} from "fs";
import {join as joinPath} from "path";
import minimist from "minimist";
import runAll from "./index";

if (require.main === module) {
  main(process.argv.slice(2));
}

function printHelp() {
  console.log(`
Usage: npm-run-all [OPTIONS] [...tasks]

  Run specified tasks.

  Options:
    -h, --help      Print this text.
    -p, --parallel  Run specified tasks on parallel.
                    By default, run on sequential.
    -v, --version   Print version number.

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

/*eslint no-process-exit:0*/
function main(args) {
  const options = minimist(args, {
    boolean: ["help", "parallel", "version"],
    alias: {"h": "help", "p": "parallel", "v": "version"},
    unknown: arg => {
      if (arg[0] === "-") {
        console.error(`Unknown Option: ${arg}`);
        process.exit(1);
      }
    }
  });

  if (options._.length === 0 || options.help) {
    printHelp();
    process.exit(0);
  }
  if (options.version) {
    printVersion();
    process.exit(0);
  }

  runAll(
      options._,
      {
        stdout: process.stdout,
        stderr: process.stderr,
        parallel: options.parallel
      }
    )
    .catch(() => process.exit(1));
}
