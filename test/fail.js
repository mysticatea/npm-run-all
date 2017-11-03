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
const nodeApi = require("../lib")
const util = require("./lib/util")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Throws an assertion error if a given promise comes to be fulfilled.
 *
 * @param {Promise} p - A promise to check.
 * @returns {Promise} A promise which is checked.
 */
function shouldFail(p) {
    return p.then(
        () => assert(false, "should fail"),
        () => null // OK!
    )
}

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[fail] it should fail", () => {
    util.moveToWorkspace()

    beforeEach(util.removeResult)
    afterEach(() => util.delay(1000))

    describe("if an invalid option exists.", () => {
        it("npm-run-all command", () => shouldFail(util.runAll(["--invalid"])))
        it("run-s command", () => shouldFail(util.runSeq(["--parallel"])))
        it("run-p command", () => shouldFail(util.runPar(["--sequential"])))

        it("npm-run-all command with --race without --parallel", () => shouldFail(util.runAll(["--race"])))
        it("npm-run-all command with --r without --parallel", () => shouldFail(util.runAll(["--r"])))
        it("run-s command with --race", () => shouldFail(util.runSeq(["--race"])))
        it("run-s command with --r", () => shouldFail(util.runSeq(["--r"])))
    })

    describe("if invalid `options.taskList` is given.", () => {
        it("Node API", () => shouldFail(nodeApi("test-task:append a", { taskList: { invalid: 0 } })))
    })

    describe("if unknown tasks are given:", () => {
        it("Node API", () => shouldFail(nodeApi("unknown-task")))
        it("npm-run-all command", () => shouldFail(util.runAll(["unknown-task"])))
        it("run-s command", () => shouldFail(util.runSeq(["unknown-task"])))
        it("run-p command", () => shouldFail(util.runPar(["unknown-task"])))
    })

    describe("if unknown tasks are given (2):", () => {
        it("Node API", () => shouldFail(nodeApi(["test-task:append:a", "unknown-task"])))
        it("npm-run-all command", () => shouldFail(util.runAll(["test-task:append:a", "unknown-task"])))
        it("run-s command", () => shouldFail(util.runSeq(["test-task:append:a", "unknown-task"])))
        it("run-p command", () => shouldFail(util.runPar(["test-task:append:a", "unknown-task"])))
    })

    describe("if package.json is not found:", () => {
        before(() => process.chdir("no-package-json"))
        after(() => process.chdir(".."))

        it("Node API", () => shouldFail(nodeApi(["test-task:append:a"])))
        it("npm-run-all command", () => shouldFail(util.runAll(["test-task:append:a"])))
        it("run-s command", () => shouldFail(util.runSeq(["test-task:append:a"])))
        it("run-p command", () => shouldFail(util.runPar(["test-task:append:a"])))
    })

    describe("if package.json does not have scripts field:", () => {
        before(() => process.chdir("no-scripts"))
        after(() => process.chdir(".."))

        it("Node API", () => shouldFail(nodeApi(["test-task:append:a"])))
        it("npm-run-all command", () => shouldFail(util.runAll(["test-task:append:a"])))
        it("run-s command", () => shouldFail(util.runSeq(["test-task:append:a"])))
        it("run-p command", () => shouldFail(util.runPar(["test-task:append:a"])))
    })

    describe("if tasks exited with non-zero code:", () => {
        it("Node API", () => shouldFail(nodeApi("test-task:error")))
        it("npm-run-all command", () => shouldFail(util.runAll(["test-task:error"])))
        it("run-s command", () => shouldFail(util.runSeq(["test-task:error"])))
        it("run-p command", () => shouldFail(util.runPar(["test-task:error"])))
    })
})
