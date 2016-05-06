/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

const assert = require("power-assert");
const {result, removeResult} = require("./lib/util");

// Test targets.
const command = require("../src/bin/npm-run-all");

describe("[mixed] npm-run-all", () => {
    before(() => process.chdir("test-workspace"));
    after(() => process.chdir(".."));

    beforeEach(removeResult);

    it("should run a mix of sequential / serial and parallel tasks (has the default group):", () =>
        command([
            "test-task:append a",
            "-p", "test-task:append b", "test-task:append c",
            "-s", "test-task:append d", "test-task:append e"
        ])
        .then(() => {
            assert(
                result() === "aabcbcddee" ||
                result() === "aabccbddee" ||
                result() === "aacbbcddee" ||
                result() === "aacbcbddee");
        })
    );

    it("should run a mix of sequential / serial and parallel tasks (doesn't have the default group):", () =>
        command([
            "-p", "test-task:append b", "test-task:append c",
            "-s", "test-task:append d", "test-task:append e"
        ])
        .then(() => {
            assert(
                result() === "bcbcddee" ||
                result() === "bccbddee" ||
                result() === "cbbcddee" ||
                result() === "cbcbddee");
        })
    );
});
