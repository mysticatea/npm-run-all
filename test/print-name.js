/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

/* eslint-disable no-trailing-spaces */
const assert = require("power-assert")
const nodeApi = require("../src/lib")
const createHeader = require("../src/lib/create-header")
const readPackageJson = require("../src/lib/read-package-json")
const BufferStream = require("./lib/buffer-stream")
const {runAll, runPar, runSeq} = require("./lib/util")

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[print-name] npm-run-all", () => {
    let packageInfo = null

    before(() => {
        process.chdir("test-workspace")
        return readPackageJson().then(info => {
            packageInfo = info.packageInfo
        })
    })
    after(() => process.chdir(".."))

    describe("should print names before running tasks:", () => {
        it("Node API", () => {
            const stdout = new BufferStream()
            return nodeApi("test-task:echo abc", {stdout, silent: true, printName: true})
                .then(() => {
                    const header = createHeader("test-task:echo abc", packageInfo, false)
                    assert.equal(stdout.value.slice(0, header.length), header)
                })
        })

        it("npm-run-all command (--print-name)", () => {
            const stdout = new BufferStream()
            return runAll(["test-task:echo abc", "--silent", "--print-name"], stdout)
                .then(() => {
                    const header = createHeader("test-task:echo abc", packageInfo, false)
                    assert.equal(stdout.value.slice(0, header.length), header)
                })
        })

        it("run-s command (--print-name)", () => {
            const stdout = new BufferStream()
            return runSeq(["test-task:echo abc", "--silent", "--print-name"], stdout)
                .then(() => {
                    const header = createHeader("test-task:echo abc", packageInfo, false)
                    assert.equal(stdout.value.slice(0, header.length), header)
                })
        })

        it("run-p command (--print-name)", () => {
            const stdout = new BufferStream()
            return runPar(["test-task:echo abc", "--silent", "--print-name"], stdout)
                .then(() => {
                    const header = createHeader("test-task:echo abc", packageInfo, false)
                    assert.equal(stdout.value.slice(0, header.length), header)
                })
        })

        it("npm-run-all command (-n)", () => {
            const stdout = new BufferStream()
            return runAll(["test-task:echo abc", "--silent", "-n"], stdout)
                .then(() => {
                    const header = createHeader("test-task:echo abc", packageInfo, false)
                    assert.equal(stdout.value.slice(0, header.length), header)
                })
        })

        it("run-s command (-n)", () => {
            const stdout = new BufferStream()
            return runSeq(["test-task:echo abc", "--silent", "-n"], stdout)
                .then(() => {
                    const header = createHeader("test-task:echo abc", packageInfo, false)
                    assert.equal(stdout.value.slice(0, header.length), header)
                })
        })

        it("run-p command (-n)", () => {
            const stdout = new BufferStream()
            return runPar(["test-task:echo abc", "--silent", "-n"], stdout)
                .then(() => {
                    const header = createHeader("test-task:echo abc", packageInfo, false)
                    assert.equal(stdout.value.slice(0, header.length), header)
                })
        })
    })
})

