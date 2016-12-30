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

describe("[print-label] npm-run-all", () => {
    before(() => process.chdir("test-workspace"))
    after(() => process.chdir(".."))

    describe("should print labels at the head of every line:", () => {
        const EXPECTED_TEXT = [
            "[test-task:echo abc] abcabc",
            "[test-task:echo abc] abc",
            "[test-task:echo abc] abcabc",
            "[test-task:echo abc] abc",
            "[test-task:echo abc] abc",
            "[test-task:echo abc] abc",
            "[test-task:echo abc] abc",
            "[test-task:echo abc] abc",
            "[test-task:echo abc] ",
            "[test-task:echo abc] abc",
            "[test-task:echo abc] abcabc",
            "[test-task:echo abc] ",
            "[test-task:echo abc] ",
            "[test-task:echo abc] ",
            "[test-task:echo abc] abc",
        ].join("\n")

        it("Node API", () => {
            const stdout = new BufferStream()
            return nodeApi("test-task:echo abc", {stdout, silent: true, printLabel: true})
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_TEXT)
                })
        })

        it("npm-run-all command (--print-label)", () => {
            const stdout = new BufferStream()
            return runAll(["test-task:echo abc", "--silent", "--print-label"], stdout)
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_TEXT)
                })
        })

        it("run-s command (--print-label)", () => {
            const stdout = new BufferStream()
            return runSeq(["test-task:echo abc", "--silent", "--print-label"], stdout)
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_TEXT)
                })
        })

        it("run-p command (--print-label)", () => {
            const stdout = new BufferStream()
            return runPar(["test-task:echo abc", "--silent", "--print-label"], stdout)
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_TEXT)
                })
        })

        it("npm-run-all command (-l)", () => {
            const stdout = new BufferStream()
            return runAll(["test-task:echo abc", "--silent", "-l"], stdout)
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_TEXT)
                })
        })

        it("run-s command (-l)", () => {
            const stdout = new BufferStream()
            return runSeq(["test-task:echo abc", "--silent", "-l"], stdout)
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_TEXT)
                })
        })

        it("run-p command (-l)", () => {
            const stdout = new BufferStream()
            return runPar(["test-task:echo abc", "--silent", "-l"], stdout)
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_TEXT)
                })
        })
    })

    describe("should print all labels with the same width:", () => {
        const EXPECTED_TEXT = [
            "[test-task:echo a   ] aa",
            "[test-task:echo a   ] a",
            "[test-task:echo a   ] aa",
            "[test-task:echo a   ] a",
            "[test-task:echo a   ] a",
            "[test-task:echo a   ] a",
            "[test-task:echo a   ] a",
            "[test-task:echo a   ] a",
            "[test-task:echo a   ] ",
            "[test-task:echo a   ] a",
            "[test-task:echo a   ] aa",
            "[test-task:echo a   ] ",
            "[test-task:echo a   ] ",
            "[test-task:echo a   ] ",
            "[test-task:echo a   ] a",
            "[test-task:echo abcd] abcdabcd",
            "[test-task:echo abcd] abcd",
            "[test-task:echo abcd] abcdabcd",
            "[test-task:echo abcd] abcd",
            "[test-task:echo abcd] abcd",
            "[test-task:echo abcd] abcd",
            "[test-task:echo abcd] abcd",
            "[test-task:echo abcd] abcd",
            "[test-task:echo abcd] ",
            "[test-task:echo abcd] abcd",
            "[test-task:echo abcd] abcdabcd",
            "[test-task:echo abcd] ",
            "[test-task:echo abcd] ",
            "[test-task:echo abcd] ",
            "[test-task:echo abcd] abcd",
            "[test-task:echo ab  ] abab",
            "[test-task:echo ab  ] ab",
            "[test-task:echo ab  ] abab",
            "[test-task:echo ab  ] ab",
            "[test-task:echo ab  ] ab",
            "[test-task:echo ab  ] ab",
            "[test-task:echo ab  ] ab",
            "[test-task:echo ab  ] ab",
            "[test-task:echo ab  ] ",
            "[test-task:echo ab  ] ab",
            "[test-task:echo ab  ] abab",
            "[test-task:echo ab  ] ",
            "[test-task:echo ab  ] ",
            "[test-task:echo ab  ] ",
            "[test-task:echo ab  ] ab",
        ].join("\n")

        it("Node API", () => {
            const stdout = new BufferStream()
            return nodeApi(
                    ["test-task:echo a", "test-task:echo abcd", "test-task:echo ab"],
                    {stdout, silent: true, printLabel: true}
                )
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_TEXT)
                })
        })

        it("npm-run-all command", () => {
            const stdout = new BufferStream()
            return runAll(
                    ["test-task:echo a", "test-task:echo abcd", "test-task:echo ab", "--silent", "--print-label"],
                    stdout
                )
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_TEXT)
                })
        })

        it("run-s command", () => {
            const stdout = new BufferStream()
            return runSeq(
                    ["test-task:echo a", "test-task:echo abcd", "test-task:echo ab", "--silent", "--print-label"],
                    stdout
                )
                .then(() => {
                    assert.equal(stdout.value, EXPECTED_TEXT)
                })
        })
    })

    describe("should work printing labels in parallel:", () => {
        const EXPECTED_LINES = [
            "\n[test-task:echo a   ] ",
            "\n[test-task:echo a   ] a",
            "\n[test-task:echo ab  ] ",
            "\n[test-task:echo ab  ] ab",
            "\n[test-task:echo abcd] ",
            "\n[test-task:echo abcd] abcd",
        ]
        const UNEXPECTED_PATTERNS = [
            /aab(cd)?/,
            /ab(cd)?a\b/,
            /\n\n/,
        ]

        it("Node API", () => {
            const stdout = new BufferStream()
            return nodeApi(
                    ["test-task:echo a", "test-task:echo abcd", "test-task:echo ab"],
                    {stdout, parallel: true, printLabel: true}
                )
                .then(() => {
                    EXPECTED_LINES.forEach(line => {
                        assert(stdout.value.indexOf(line) !== -1)
                    })
                    UNEXPECTED_PATTERNS.forEach(pattern => {
                        assert(!pattern.test(stdout.value))
                    })
                })
        })

        it("npm-run-all command", () => {
            const stdout = new BufferStream()
            return runAll(
                    ["--parallel", "test-task:echo a", "test-task:echo abcd", "test-task:echo ab", "--print-label"],
                    stdout
                )
                .then(() => {
                    EXPECTED_LINES.forEach(line => {
                        assert(stdout.value.indexOf(line) !== -1)
                    })
                    UNEXPECTED_PATTERNS.forEach(pattern => {
                        assert(!pattern.test(stdout.value))
                    })
                })
        })

        it("run-p command", () => {
            const stdout = new BufferStream()
            return runPar(
                    ["test-task:echo a", "test-task:echo abcd", "test-task:echo ab", "--print-label"],
                    stdout
                )
                .then(() => {
                    EXPECTED_LINES.forEach(line => {
                        assert(stdout.value.indexOf(line) !== -1)
                    })
                    UNEXPECTED_PATTERNS.forEach(pattern => {
                        assert(!pattern.test(stdout.value))
                    })
                })
        })
    })
})

