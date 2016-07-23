"use strict"

var appendResult = require("./lib/util").appendResult

/**
 * Append a given text into `test.txt`.
 * @returns {void}
 */
function append() {
    appendResult(process.argv[2])
}

append()
setTimeout(append, 3000)

// SIGINT/SIGTERM Handling.
process.on("SIGINT", function() {
    process.exit(0)
})
process.on("SIGTERM", function() {
    process.exit(0)
})
