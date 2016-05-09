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
const runPar = require("../src/bin/run-p");

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[parallel]", () => {
    before(() => process.chdir("test-workspace"));
    after(() => process.chdir(".."));

    beforeEach(removeResult);

    describe("should run tasks on parallel when was given --parallel option:", () => {
        it("Node API", () =>
            nodeApi(["test-task:append a", "test-task:append b"], {parallel: true})
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                })
        );

        it("npm-run-all command", () =>
            runAll(["--parallel", "test-task:append a", "test-task:append b"])
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                })
        );

        it("run-p command", () =>
            runPar(["test-task:append a", "test-task:append b"])
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                })
        );
    });

    describe("should kill all tasks when was given --parallel option if a task exited with non-zero code:", () => {
        it("Node API", () =>
            nodeApi(["test-task:append2 a", "test-task:error"], {parallel: true})
                .then(
                    () => {
                        assert(false, "should fail");
                    },
                    () => {
                        assert(result() == null || result() === "a");
                    })
        );

        it("npm-run-all command", () =>
            runAll(["--parallel", "test-task:append2 a", "test-task:error"])
                .then(
                    () => {
                        assert(false, "should fail");
                    },
                    () => {
                        assert(result() == null || result() === "a");
                    }
                )
        );

        it("run-p command", () =>
            runPar(["test-task:append2 a", "test-task:error"])
                .then(
                    () => {
                        assert(false, "should fail");
                    },
                    () => {
                        assert(result() == null || result() === "a");
                    }
                )
        );
    });

    describe("should remove intersected tasks from two or more patterns:", () => {
        it("Node API", () =>
            nodeApi(["test-task:*:a", "*:append:a"], {parallel: true})
                .then(() => {
                    assert(result() === "aa");
                })
        );

        it("npm-run-all command", () =>
            runAll(["--parallel", "test-task:*:a", "*:append:a"])
                .then(() => {
                    assert(result() === "aa");
                })
        );

        it("run-p command", () =>
            runPar(["test-task:*:a", "*:append:a"])
                .then(() => {
                    assert(result() === "aa");
                })
        );
    });

    describe("should not remove duplicate tasks from two or more the same pattern:", () => {
        it("Node API", () =>
            nodeApi(["test-task:*:a", "test-task:*:a"], {parallel: true})
                .then(() => {
                    assert(result() === "aaaa");
                })
        );

        it("npm-run-all command", () =>
            runAll(["--parallel", "test-task:*:a", "test-task:*:a"])
                .then(() => {
                    assert(result() === "aaaa");
                })
        );

        it("run-p command", () =>
            runPar(["test-task:*:a", "test-task:*:a"])
                .then(() => {
                    assert(result() === "aaaa");
                })
        );
    });

    describe("should kill child processes when it's killed", () => {
        it("npm-run-all command", () =>
            spawnWithKill(
                "node",
                ["../node_modules/babel/bin/babel-node.js", "../src/bin/npm-run-all/index.js", "--parallel", "test-task:append2 a"]
            )
            .then(() => {
                assert(result() == null || result() === "a");
            })
        );

        it("run-p command", () =>
            spawnWithKill(
                "node",
                ["../node_modules/babel/bin/babel-node.js", "../src/bin/run-p/index.js", "test-task:append2 a"]
            )
            .then(() => {
                assert(result() == null || result() === "a");
            })
        );
    });

    describe("should continue on error when --continue-on-error option was specified:", () => {
        it("Node API", () =>
            nodeApi(["test-task:append a", "test-task:error", "test-task:append b"], {parallel: true, continueOnError: true})
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                })
        );

        it("npm-run-all command (--continue-on-error)", () =>
            runAll(["--continue-on-error", "--parallel", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                })
        );

        it("npm-run-all command (-c)", () =>
            runAll(["-cp", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                })
        );

        it("run-p command (--continue-on-error)", () =>
            runPar(["--continue-on-error", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                })
        );

        it("run-p command (-c)", () =>
            runPar(["-c", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                })
        );
    });
});
