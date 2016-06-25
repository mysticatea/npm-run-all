"use strict"

var appendResult = require("./lib/util").appendResult

process.stdin.on("data", function(chunk) {
    appendResult(chunk.toString())
    process.exit(0)
})
setTimeout(function() {
    process.exit(1)
}, 5000)
