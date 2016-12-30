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
const util = require("./lib/util")
const result = util.result
const removeResult = util.removeResult
const runAll = util.runAll
const runPar = util.runPar
const runSeq = util.runSeq

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[config] it should have an ability to set config variables:", () => {
    before(() => process.chdir("test-workspace"))
    after(() => process.chdir(".."))

    beforeEach(removeResult)

    it("Node API should address \"config\" option", () =>
        nodeApi("test-task:config", {config: {test: "this is a config"}})
            .then(() => {
                assert(result() === "this is a config")
            })
    )

    it("Node API should address \"config\" option for multiple variables", () =>
        nodeApi("test-task:config2", {config: {test: "1", test2: "2", test3: "3"}})
            .then(() => {
                assert(result() === "1\n2\n3")
            })
    )

    describe("CLI commands should address \"--a=b\" style options", () => {
        it("npm-run-all command", () =>
            runAll(["test-task:config", "--test=GO"])
                .then(() => {
                    assert(result() === "GO")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:config", "--test=GO"])
                .then(() => {
                    assert(result() === "GO")
                })
        )

        it("run-p command", () =>
            runPar(["test-task:config", "--test=GO"])
                .then(() => {
                    assert(result() === "GO")
                })
        )
    })

    describe("CLI commands should address \"--b=c\" style options for multiple variables", () => {
        it("npm-run-all command", () =>
            runAll(["test-task:config2", "--test=1", "--test2=2", "--test3=3"])
                .then(() => {
                    assert(result() === "1\n2\n3")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:config2", "--test=1", "--test2=2", "--test3=3"])
                .then(() => {
                    assert(result() === "1\n2\n3")
                })
        )

        it("run-p command", () =>
            runPar(["test-task:config2", "--test=1", "--test2=2", "--test3=3"])
                .then(() => {
                    assert(result() === "1\n2\n3")
                })
        )
    })

    describe("CLI commands should transfar configs to nested commands.", () => {
        it("npm-run-all command", () =>
            runAll(["test-task:nested-config", "--test=GO DEEP"])
                .then(() => {
                    assert(result() === "GO DEEP")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:nested-config", "--test=GO DEEP"])
                .then(() => {
                    assert(result() === "GO DEEP")
                })
        )

        it("run-p command", () =>
            runPar(["test-task:nested-config", "--test=GO DEEP"])
                .then(() => {
                    assert(result() === "GO DEEP")
                })
        )
    })
})
