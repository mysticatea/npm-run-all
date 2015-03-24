/*eslint no-process-exit:0*/

var appendResult = require("../lib/util").appendResult;

if (process.argv[2] === "--wait-input") {
  process.stdin.on("data", function(chunk) {
    appendResult(chunk.toString());
    process.exit(0);
  });
  setTimeout(function() { process.exit(1); }, 10000);
}

process.stdout.write("STDOUT");
process.stderr.write("STDERR");
