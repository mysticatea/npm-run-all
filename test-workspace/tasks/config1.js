"use strict"

var appendResult = require("./lib/util").appendResult
appendResult(String(process.env.npm_config_test))
