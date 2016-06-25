"use strict"

var appendResult = require("./lib/util").appendResult
appendResult(JSON.stringify(process.argv.slice(2)))
