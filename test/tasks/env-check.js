var appendResult = require("../lib/util").appendResult;

if (process.env.npm_package_config_test === "OK") {
    appendResult("OK");
}
else {
    appendResult("NOT OK");
}
