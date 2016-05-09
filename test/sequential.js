/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("power-assert");
const {result, removeResult} = require("./lib/util");
const spawnWithKill = require("./lib/spawn-with-kill");

// Test targets.
const nodeApi = require("../src/lib");
const runAll = require("../src/bin/npm-run-all");
const runSeq = require("../src/bin/run-s");

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[sequencial] npm-run-all", () => {
    before(() => process.chdir("test-workspace"));
    after(() => process.chdir(".."));

    beforeEach(removeResult);

    describe("should run tasks sequentially:", () => {
        it("Node API", () =>
            nodeApi(["test-task:append a", "test-task:append b"], {parallel: false})
                .then(() => {
                    assert(result() === "aabb");
                })
        );

        it("npm-run-all command", () =>
            runAll(["test-task:append a", "test-task:append b"])
                .then(() => {
                    assert(result() === "aabb");
                })
        );

        it("run-s command", () =>
            runSeq(["test-task:append a", "test-task:append b"])
                .then(() => {
                    assert(result() === "aabb");
                })
        );
    });

    describe("should remove intersected tasks from two or more patterns:", () => {
        it("Node API", () =>
            nodeApi(["test-task:*:a", "*:append:a"], {parallel: false})
                .then(() => {
                    assert(result() === "aa");
                })
        );

        it("npm-run-all command", () =>
            runAll(["test-task:*:a", "*:append:a"])
                .then(() => {
                    assert(result() === "aa");
                })
        );

        it("run-s command", () =>
            runSeq(["test-task:*:a", "*:append:a"])
                .then(() => {
                    assert(result() === "aa");
                })
        );
    });

    describe("should not remove duplicate tasks from two or more the same pattern:", () => {
        it("Node API", () =>
            nodeApi(["test-task:*:a", "test-task:*:a"], {parallel: false})
                .then(() => {
                    assert(result() === "aaaa");
                })
        );

        it("npm-run-all command", () =>
            runAll(["test-task:*:a", "test-task:*:a"])
                .then(() => {
                    assert(result() === "aaaa");
                })
        );

        it("run-s command", () =>
            runSeq(["test-task:*:a", "test-task:*:a"])
                .then(() => {
                    assert(result() === "aaaa");
                })
        );
    });

    describe("should kill child processes when it's killed", () => {
        it("npm-run-all command", () =>
            spawnWithKill(
                "node",
                ["../node_modules/babel/bin/babel-node.js", "../src/bin/npm-run-all.js", "test-task:append2 a"]
            )
            .then(() => {
                assert(result() == null || result() === "a");
            })
        );

        it("run-s command", () =>
            spawnWithKill(
                "node",
                ["../node_modules/babel/bin/babel-node.js", "../src/bin/run-s/index.js", "test-task:append2 a"]
            )
            .then(() => {
                assert(result() == null || result() === "a");
            })
        );
    });

    describe("should continue on error when --continue-on-error option was specified:", () => {
        it("Node API", () =>
            nodeApi(["test-task:append a", "test-task:error", "test-task:append b"], {continueOnError: true})
                .then(() => {
                    assert(result() === "aabb");
                })
        );

        it("npm-run-all command (--continue-on-error)", () =>
            runAll(["--continue-on-error", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(() => {
                    assert(result() === "aabb");
                })
        );

        it("run-s command (--continue-on-error)", () =>
            runSeq(["--continue-on-error", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(() => {
                    assert(result() === "aabb");
                })
        );

        it("npm-run-all command (-c)", () =>
            runAll(["-c", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(() => {
                    assert(result() === "aabb");
                })
        );

        it("run-s command (-c)", () =>
            runSeq(["-c", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(() => {
                    assert(result() === "aabb");
                })
        );
    });
});
