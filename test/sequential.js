/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("power-assert")
const nodeApi = require("../src/lib")
const spawnWithKill = require("./lib/spawn-with-kill")
const util = require("./lib/util")
const result = util.result
const removeResult = util.removeResult
const runAll = util.runAll
const runSeq = util.runSeq

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[sequencial] npm-run-all", () => {
    before(() => process.chdir("test-workspace"))
    after(() => process.chdir(".."))

    beforeEach(removeResult)

    describe("should run tasks sequentially:", () => {
        it("Node API", () =>
            nodeApi(["test-task:append a", "test-task:append b"], {parallel: false})
                .then(results => {
                    assert(results.length === 2)
                    assert(results[0].name === "test-task:append a")
                    assert(results[0].code === 0)
                    assert(results[1].name === "test-task:append b")
                    assert(results[1].code === 0)
                    assert(result() === "aabb")
                })
        )

        it("npm-run-all command", () =>
            runAll(["test-task:append a", "test-task:append b"])
                .then(() => {
                    assert(result() === "aabb")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:append a", "test-task:append b"])
                .then(() => {
                    assert(result() === "aabb")
                })
        )
    })

    describe("should not run subsequent tasks if a task exited with a non-zero code:", () => {
        it("Node API", () =>
            nodeApi(["test-task:append2 a", "test-task:error", "test-task:append2 b"])
                .then(
                    () => {
                        assert(false, "should fail")
                    },
                    (err) => {
                        assert(err.results.length === 3)
                        assert(err.results[0].name === "test-task:append2 a")
                        assert(err.results[0].code === 0)
                        assert(err.results[1].name === "test-task:error")
                        assert(err.results[1].code === 1)
                        assert(err.results[2].name === "test-task:append2 b")
                        assert(err.results[2].code === undefined)
                        assert(result() === "aa")
                    })
        )

        it("npm-run-all command", () =>
            runAll(["test-task:append2 a", "test-task:error", "test-task:append2 b"])
                .then(
                    () => {
                        assert(false, "should fail")
                    },
                    () => {
                        assert(result() === "aa")
                    }
                )
        )

        it("run-s command", () =>
            runSeq(["test-task:append2 a", "test-task:error", "test-task:append2 b"])
                .then(
                    () => {
                        assert(false, "should fail")
                    },
                    () => {
                        assert(result() === "aa")
                    }
                )
        )
    })

    describe("should remove intersected tasks from two or more patterns:", () => {
        it("Node API", () =>
            nodeApi(["test-task:*:a", "*:append:a"], {parallel: false})
                .then(() => {
                    assert(result() === "aa")
                })
        )

        it("npm-run-all command", () =>
            runAll(["test-task:*:a", "*:append:a"])
                .then(() => {
                    assert(result() === "aa")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:*:a", "*:append:a"])
                .then(() => {
                    assert(result() === "aa")
                })
        )
    })

    describe("should not remove duplicate tasks from two or more the same pattern:", () => {
        it("Node API", () =>
            nodeApi(["test-task:*:a", "test-task:*:a"], {parallel: false})
                .then(() => {
                    assert(result() === "aaaa")
                })
        )

        it("npm-run-all command", () =>
            runAll(["test-task:*:a", "test-task:*:a"])
                .then(() => {
                    assert(result() === "aaaa")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:*:a", "test-task:*:a"])
                .then(() => {
                    assert(result() === "aaaa")
                })
        )
    })

    describe("should kill child processes when it's killed", () => {
        it("npm-run-all command", () =>
            spawnWithKill(
                "node",
                ["../node_modules/babel/bin/babel-node.js", "../src/bin/npm-run-all.js", "test-task:append2 a"]
            )
            .then(() => {
                assert(result() == null || result() === "a")
            })
        )

        it("run-s command", () =>
            spawnWithKill(
                "node",
                ["../node_modules/babel/bin/babel-node.js", "../src/bin/run-s/index.js", "test-task:append2 a"]
            )
            .then(() => {
                assert(result() == null || result() === "a")
            })
        )
    })

    describe("should continue on error when --continue-on-error option was specified:", () => {
        it("Node API", () =>
            nodeApi(["test-task:append a", "test-task:error", "test-task:append b"], {continueOnError: true})
                .then(
                    () => {
                        assert(false, "should fail.")
                    },
                    () => {
                        assert(result() === "aabb")
                    }
                )
        )

        it("npm-run-all command (--continue-on-error)", () =>
            runAll(["--continue-on-error", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(
                    () => {
                        assert(false, "should fail.")
                    },
                    () => {
                        assert(result() === "aabb")
                    }
                )
        )

        it("run-s command (--continue-on-error)", () =>
            runSeq(["--continue-on-error", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(
                    () => {
                        assert(false, "should fail.")
                    },
                    () => {
                        assert(result() === "aabb")
                    }
                )
        )

        it("npm-run-all command (-c)", () =>
            runAll(["-c", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(
                    () => {
                        assert(false, "should fail.")
                    },
                    () => {
                        assert(result() === "aabb")
                    }
                )
        )

        it("run-s command (-c)", () =>
            runSeq(["-c", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(
                    () => {
                        assert(false, "should fail.")
                    },
                    () => {
                        assert(result() === "aabb")
                    }
                )
        )
    })
})
