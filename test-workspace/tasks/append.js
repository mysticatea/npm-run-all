"use strict";

var appendResult = require("../../test/lib/util").appendResult;

/**
 * Append a given text into `test.txt`.
 */
function append() {
    appendResult(process.argv[2]);
}

append();
setTimeout(append, 1000);
