"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("power-assert")
const util = require("./lib/util")
const BufferStream = require("./lib/buffer-stream")
const removeResult = util.removeResult
const runPar = util.runPar

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[custom labels]", () => {
    before(() => process.chdir("test-workspace"))
    after(() => process.chdir(".."))

    beforeEach(removeResult)

    describe("should use the given label instead of script name", () => {
        const EXPECTED_LINES = [
            "[Unit Test         ] abcabc",
            "[Unit Test         ] abc",
            "[Unit Test         ] abcabc",
            "[Unit Test         ] abc",
            "[Unit Test         ] abc",
            "[Unit Test         ] abc",
            "[Unit Test         ] abc",
            "[Unit Test         ] abc",
            "[Unit Test         ] ",
            "[Unit Test         ] abc",
            "[Unit Test         ] abcabc",
            "[Unit Test         ] ",
            "[Unit Test         ] ",
            "[Unit Test         ] ",
            "[Unit Test         ] abc",

            "[test-task:echo def] defdef",
            "[test-task:echo def] def",
            "[test-task:echo def] defdef",
            "[test-task:echo def] def",
            "[test-task:echo def] def",
            "[test-task:echo def] def",
            "[test-task:echo def] def",
            "[test-task:echo def] def",
            "[test-task:echo def] ",
            "[test-task:echo def] def",
            "[test-task:echo def] defdef",
            "[test-task:echo def] ",
            "[test-task:echo def] ",
            "[test-task:echo def] ",
            "[test-task:echo def] def",
        ]

        it("npm-run-all --labels=\"Unit Test\"", async () => {
            const stdout = new BufferStream()
            await runPar(["test-task:echo abc", "test-task:echo def", "--silent", "--print-label", "--labels=Unit Test"], stdout)
            for (const line of stdout.value.split(/\n\r?/g)) {
                assert(EXPECTED_LINES.includes(line), `Missing line: ${line}`)
            }
        })
    })

    describe("should use all given label instead of script name", () => {
        const EXPECTED_LINES = [
            "[Unit Test 1] abcabc",
            "[Unit Test 1] abc",
            "[Unit Test 1] abcabc",
            "[Unit Test 1] abc",
            "[Unit Test 1] abc",
            "[Unit Test 1] abc",
            "[Unit Test 1] abc",
            "[Unit Test 1] abc",
            "[Unit Test 1] ",
            "[Unit Test 1] abc",
            "[Unit Test 1] abcabc",
            "[Unit Test 1] ",
            "[Unit Test 1] ",
            "[Unit Test 1] ",
            "[Unit Test 1] abc",

            "[Unit Test 2] defdef",
            "[Unit Test 2] def",
            "[Unit Test 2] defdef",
            "[Unit Test 2] def",
            "[Unit Test 2] def",
            "[Unit Test 2] def",
            "[Unit Test 2] def",
            "[Unit Test 2] def",
            "[Unit Test 2] ",
            "[Unit Test 2] def",
            "[Unit Test 2] defdef",
            "[Unit Test 2] ",
            "[Unit Test 2] ",
            "[Unit Test 2] ",
            "[Unit Test 2] def",
        ]

        it("npm-run-all --labels=\"Unit Test 1,Unit Test 2\"", async () => {
            const stdout = new BufferStream()
            await runPar(["test-task:echo abc", "test-task:echo def", "--silent", "--print-label", "--labels=Unit Test 1,Unit Test 2"], stdout)
            for (const line of stdout.value.split(/\n\r?/g)) {
                assert(EXPECTED_LINES.includes(line), `Missing line: ${line}`)
            }
        })
    })
})
