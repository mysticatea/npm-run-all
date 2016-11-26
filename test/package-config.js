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
const {result, removeResult, runAll, runPar, runSeq} = require("./lib/util")

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[package-config] it should have an ability to overwrite package's config:", () => {
    before(() => process.chdir("test-workspace"))
    after(() => process.chdir(".."))

    beforeEach(removeResult)

    it("Node API should address \"packageConfig\" option", () =>
        nodeApi("test-task:package-config", {packageConfig: {"npm-run-all-test": {test: "OVERWRITTEN"}}})
            .then(() => {
                assert(result() === "OVERWRITTEN")
            })
    )

    it("Node API should address \"packageConfig\" option for multiple variables", () =>
        nodeApi("test-task:package-config2", {packageConfig: {"npm-run-all-test": {test: "1", test2: "2", test3: "3"}}})
            .then(() => {
                assert(result() === "1\n2\n3")
            })
    )

    describe("CLI commands should address \"--a:b=c\" style options", () => {
        it("npm-run-all command", () =>
            runAll(["test-task:package-config", "--npm-run-all-test:test=OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:package-config", "--npm-run-all-test:test=OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )

        it("run-p command", () =>
            runPar(["test-task:package-config", "--npm-run-all-test:test=OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )
    })

    describe("CLI commands should address \"--a:b=c\" style options for multiple variables", () => {
        it("npm-run-all command", () =>
            runAll(["test-task:package-config2", "--npm-run-all-test:test=1", "--npm-run-all-test:test2=2", "--npm-run-all-test:test3=3"])
                .then(() => {
                    assert(result() === "1\n2\n3")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:package-config2", "--npm-run-all-test:test=1", "--npm-run-all-test:test2=2", "--npm-run-all-test:test3=3"])
                .then(() => {
                    assert(result() === "1\n2\n3")
                })
        )

        it("run-p command", () =>
            runPar(["test-task:package-config2", "--npm-run-all-test:test=1", "--npm-run-all-test:test2=2", "--npm-run-all-test:test3=3"])
                .then(() => {
                    assert(result() === "1\n2\n3")
                })
        )
    })

    describe("CLI commands should address \"--a:b c\" style options", () => {
        it("npm-run-all command", () =>
            runAll(["test-task:package-config", "--npm-run-all-test:test", "OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:package-config", "--npm-run-all-test:test", "OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )

        it("run-p command", () =>
            runPar(["test-task:package-config", "--npm-run-all-test:test", "OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )
    })

    describe("CLI commands should transfar overriting nested commands.", () => {
        it("npm-run-all command", () =>
            runAll(["test-task:nested-package-config", "--npm-run-all-test:test", "OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )

        it("run-s command", () =>
            runSeq(["test-task:nested-package-config", "--npm-run-all-test:test", "OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )

        it("run-p command", () =>
            runPar(["test-task:nested-package-config", "--npm-run-all-test:test", "OVERWRITTEN"])
                .then(() => {
                    assert(result() === "OVERWRITTEN")
                })
        )
    })
})
