/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("power-assert")
const nodeApi = require("../lib")
const util = require("./lib/util")
const result = util.result
const removeResult = util.removeResult
const runAll = util.runAll
const runPar = util.runPar
const runSeq = util.runSeq

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[package-config] it should have an ability to overwrite package's config:", () => {
    before(() => process.chdir("test-workspace"))
    after(() => process.chdir(".."))

    beforeEach(removeResult)

    it('Node API should address "packageConfig" option', async () => {
        await nodeApi("test-task:package-config", {
            packageConfig: { "npm-run-all-test": { test: "OVERWRITTEN" } },
        })
        assert(result() === "OVERWRITTEN")
    })

    it('Node API should address "packageConfig" option for multiple variables', async () => {
        await nodeApi("test-task:package-config2", {
            packageConfig: {
                "npm-run-all-test": { test: "1", test2: "2", test3: "3" },
            },
        })
        assert(result() === "1\n2\n3")
    })

    describe('CLI commands should address "--a:b=c" style options', () => {
        it("npm-run-all command", async () => {
            await runAll([
                "test-task:package-config",
                "--npm-run-all-test:test=OVERWRITTEN",
            ])
            assert(result() === "OVERWRITTEN")
        })

        it("run-s command", async () => {
            await runSeq([
                "test-task:package-config",
                "--npm-run-all-test:test=OVERWRITTEN",
            ])
            assert(result() === "OVERWRITTEN")
        })

        it("run-p command", async () => {
            await runPar([
                "test-task:package-config",
                "--npm-run-all-test:test=OVERWRITTEN",
            ])
            assert(result() === "OVERWRITTEN")
        })
    })

    describe('CLI commands should address "--a:b=c" style options for multiple variables', () => {
        it("npm-run-all command", async () => {
            await runAll([
                "test-task:package-config2",
                "--npm-run-all-test:test=1",
                "--npm-run-all-test:test2=2",
                "--npm-run-all-test:test3=3",
            ])
            assert(result() === "1\n2\n3")
        })

        it("run-s command", async () => {
            await runSeq([
                "test-task:package-config2",
                "--npm-run-all-test:test=1",
                "--npm-run-all-test:test2=2",
                "--npm-run-all-test:test3=3",
            ])
            assert(result() === "1\n2\n3")
        })

        it("run-p command", async () => {
            await runPar([
                "test-task:package-config2",
                "--npm-run-all-test:test=1",
                "--npm-run-all-test:test2=2",
                "--npm-run-all-test:test3=3",
            ])
            assert(result() === "1\n2\n3")
        })
    })

    describe('CLI commands should address "--a:b c" style options', () => {
        it("npm-run-all command", async () => {
            await runAll([
                "test-task:package-config",
                "--npm-run-all-test:test",
                "OVERWRITTEN",
            ])
            assert(result() === "OVERWRITTEN")
        })

        it("run-s command", async () => {
            await runSeq([
                "test-task:package-config",
                "--npm-run-all-test:test",
                "OVERWRITTEN",
            ])
            assert(result() === "OVERWRITTEN")
        })

        it("run-p command", async () => {
            await runPar([
                "test-task:package-config",
                "--npm-run-all-test:test",
                "OVERWRITTEN",
            ])
            assert(result() === "OVERWRITTEN")
        })
    })

    describe("CLI commands should transfar overriting nested commands.", () => {
        it("npm-run-all command", async () => {
            await runAll([
                "test-task:nested-package-config",
                "--npm-run-all-test:test",
                "OVERWRITTEN",
            ])
            assert(result() === "OVERWRITTEN")
        })

        it("run-s command", async () => {
            await runSeq([
                "test-task:nested-package-config",
                "--npm-run-all-test:test",
                "OVERWRITTEN",
            ])
            assert(result() === "OVERWRITTEN")
        })

        it("run-p command", async () => {
            await runPar([
                "test-task:nested-package-config",
                "--npm-run-all-test:test",
                "OVERWRITTEN",
            ])
            assert(result() === "OVERWRITTEN")
        })
    })
})
