"use strict"

var appendResult = require("./lib/util").appendResult

appendResult(process.argv[2])
setTimeout(function() {
    appendResult(process.argv[2])
    process.exit(0)
}, 2000)

// SIGINT/SIGTERM Handling.
process.on("SIGINT", function() {
    process.exit(0)
})
process.on("SIGTERM", function() {
    process.exit(0)
})
