"use strict";

var appendResult = require("./lib/util").appendResult;

/**
 * Append a given text into `test.txt`.
 * @returns {void}
 */
function append() {
    appendResult(process.argv[2]);
}

append();
setTimeout(append, 1000);
