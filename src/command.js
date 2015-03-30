#!/usr/bin/env node

import runAll from "./index";

if (require.main === module) {
  main(process.argv.slice(2));
}

function printHelp() {
  console.log(`
Usage: npm-run-all [OPTIONS] [...tasks]

  Run specified tasks.

  Options:
    -h, --help                  Print this text.
    -p, --parallel [...tasks]   Grouping tasks to run on parallel.
    -s, --sequential [...tasks] Grouping tasks to run on sequential.
    -v, --version               Print version number.

  See Also:
    https://github.com/mysticatea/npm-run-all
`);
}

function printVersion() {
  console.log("v" + require("../package.json").version);
}

function createQueue(args) {
  return args.reduce((queue, arg) => {
    switch (arg) {
      case "-s":
      case "--sequential":
        queue.push({parallel: false, tasks: []});
        break;

      case "-p":
      case "--parallel":
        queue.push({parallel: true, tasks: []});
        break;

      default:
        if (arg[0] === "-") {
          throw new Error("Invalid Option: " + arg);
        }
        queue[queue.length - 1].tasks.push(arg);
        break;
    }
    return queue;
  }, [{parallel: false, tasks: []}]);
}

/*eslint no-process-exit:0*/
function main(args) {
  if (args.length === 0) {
    args.push("--help");
  }
  switch (args[0]) {
    case "-h":
    case "--help":
      printHelp();
      return;

    case "-v":
    case "--version":
      printVersion();
      return;
  }

  let queue;
  try {
    queue = createQueue(args);
  }
  catch (err) {
    console.error(err.message);
    process.exit(1);
  }

  (function next() {
    const group = queue.shift();
    if (group == null) {
      return;
    }
    if (group.tasks.length === 0) {
      next();
      return;
    }
    runAll(
      group.tasks,
      {
        stdout: process.stdout,
        stderr: process.stderr,
        parallel: group.parallel
      })
      .then(next, () => process.exit(1));
  })();
}
