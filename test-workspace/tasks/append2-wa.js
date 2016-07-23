"use strict"

var util = require("./lib/util")

util.appendResult(process.argv[2])
setTimeout(function() {
    util.appendResult(process.argv[2])
    process.exit(0)
}, 10000)

// SIGINT/SIGTERM Handling.
process.on("SIGINT", function() {
    process.exit(0)
})
process.on("SIGTERM", function() {
    process.exit(0)
})
