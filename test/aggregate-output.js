
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
const BufferStream = require("./lib/buffer-stream")
const util = require("./lib/util")
const runAll = util.runAll
const runPar = util.runPar
const runSeq = util.runSeq

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[aggregated-output] npm-run-all", () => {
    before(() => process.chdir("test-workspace"))
    after(() => process.chdir(".."))

    /**
     * create expected text
     * @param {string} term  the term to use when creating a line
     * @returns {string} the complete line
     */
    function createExpectedOutput(term) {
        return `[${term}]__[${term}]`
    }

    describe("should not intermingle output of various commands", () => {
        const EXPECTED_SERIALIZED_TEXT = [
            createExpectedOutput("first"),
            createExpectedOutput("second"),
            `${createExpectedOutput("third")}\n`,
        ].join("\n")

        const EXPECTED_PARALLELIZED_TEXT = [
            createExpectedOutput("second"),
            createExpectedOutput("third"),
            `${createExpectedOutput("first")}\n`,
        ].join("\n")

        let stdout = null

        beforeEach(() => {
            stdout = new BufferStream()
        })

        it("Node API", () => nodeApi(
                    ["test-task:delayed first 300", "test-task:delayed second 100", "test-task:delayed third 200"],
                    {stdout, silent: true, aggregateOutput: true}
                )
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_SERIALIZED_TEXT)
                }))

        it("npm-run-all command", () => runAll(
                    ["test-task:delayed first 300", "test-task:delayed second 100", "test-task:delayed third 200", "--silent", "--aggregateOutput"],
                    stdout
                )
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_SERIALIZED_TEXT)
                }))

        it("run-s command", () => runSeq(
                    ["test-task:delayed first 300", "test-task:delayed second 100", "test-task:delayed third 200", "--silent", "--aggregateOutput"],
                    stdout
                )
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_SERIALIZED_TEXT)
                }))

        it("run-p command", () => runPar([
            "test-task:delayed first 3000",
            "test-task:delayed second 1000",
            "test-task:delayed third 2000",
            "--silent", "--aggregateOutput"],
                    stdout
                )
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_PARALLELIZED_TEXT)
                }))
    })
})

