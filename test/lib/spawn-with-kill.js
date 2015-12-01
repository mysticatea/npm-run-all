"use strict";

var spawn = require("../../src/lib/spawn").default;

module.exports = function spawnWithKill(command, args) {
    return new Promise(function(resolve, reject) {
        var cp = spawn(command, args, {});
        cp.on("exit", resolve);
        cp.on("error", reject);

        setTimeout(function() { cp.kill(); }, 1000);
    });
};
