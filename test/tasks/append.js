var appendResult = require("../lib/util").appendResult;

function append() {
    appendResult(process.argv[2]);
}

append();
setTimeout(append, 1000);
