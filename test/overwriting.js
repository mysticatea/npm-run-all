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
const {result, removeResult} = require("./lib/util")

// Test targets.
const nodeApi = require("../src/lib")
const runAll = require("../src/bin/npm-run-all")
const runSeq = require("../src/bin/run-s")
const runPar = require("../src/bin/run-p")

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[overwriting] it should have an ability to overwrite package's config:", () => {
    before(() => process.chdir("test-workspace"))
    after(() => process.chdir(".."))

    beforeEach(removeResult)

    it("Node API should address \"packageConfig\" option", () =>
        nodeApi("test-task:env-check", {packageConfig: {"npm-run-all-test": {test: "OVERWRITTEN"}}})
            .then(() => {
                assert(result() === "OVERWRITTEN")
            })
    )

    it("Node API should address \"packageConfig\" option for multiple variables", () =>
        nodeApi("test-task:env-check2", {packageConfig: {"npm-run-all-test": {test: "1", test2: "2", test3: "3"}}})
            .then(() => {
                assert(result() === "1\n2\n3")
            })
    )

    describe("CLI commands should address \"--a:b=c\" style options", () => {
        it("npm-run-all command", () =>
            runAll(["test-task:env-check", "--npm-run-all-test:test=OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:env-check", "--npm-run-all-test:test=OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )

        it("run-p command", () =>
            runPar(["test-task:env-check", "--npm-run-all-test:test=OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )
    })

    describe("CLI commands should address \"--a:b=c\" style options for multiple variables", () => {
        it("npm-run-all command", () =>
            runAll(["test-task:env-check2", "--npm-run-all-test:test=1", "--npm-run-all-test:test2=2", "--npm-run-all-test:test3=3"])
                .then(() => {
                    assert(result() === "1\n2\n3")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:env-check2", "--npm-run-all-test:test=1", "--npm-run-all-test:test2=2", "--npm-run-all-test:test3=3"])
                .then(() => {
                    assert(result() === "1\n2\n3")
                })
        )

        it("run-p command", () =>
            runPar(["test-task:env-check2", "--npm-run-all-test:test=1", "--npm-run-all-test:test2=2", "--npm-run-all-test:test3=3"])
                .then(() => {
                    assert(result() === "1\n2\n3")
                })
        )
    })

    describe("CLI commands should address \"--a:b c\" style options", () => {
        it("npm-run-all command", () =>
            runAll(["test-task:env-check", "--npm-run-all-test:test", "OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:env-check", "--npm-run-all-test:test", "OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )

        it("run-p command", () =>
            runPar(["test-task:env-check", "--npm-run-all-test:test", "OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )
    })

    describe("CLI commands should transfar overriting nested commands.", () => {
        it("npm-run-all command", () =>
            runAll(["test-task:nested-env-check", "--npm-run-all-test:test", "OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:nested-env-check", "--npm-run-all-test:test", "OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )

        it("run-p command", () =>
            runPar(["test-task:nested-env-check", "--npm-run-all-test:test", "OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )
    })
})
