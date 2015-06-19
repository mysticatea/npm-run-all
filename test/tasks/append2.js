console.log("APPEND2", process.argv[2], "ENTER");

var appendResult = require("../lib/util").appendResult;

function append() {
  console.log("APPEND2", process.argv[2], "APPEND");
  appendResult(process.argv[2]);
}

append();
setTimeout(function() {
  console.log("APPEND2", process.argv[2], "1");
  setTimeout(function() {
    console.log("APPEND2", process.argv[2], "2");
    setTimeout(append, 1000);
  }, 1000);
}, 1000);

process.on("exit", function(code) {
  console.log("APPEND2", process.argv[2], "EXIT", code);
});

// SIGINT/SIGTERM Handling.
process.on("SIGINT", function() {
  console.log("APPEND2", process.argv[2], "SIGINT received");
  process.exit(0);
});
process.on("SIGTERM", function() {
  console.log("APPEND2", process.argv[2], "SIGTERM received");
  process.exit(0);
});
