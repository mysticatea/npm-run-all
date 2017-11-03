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
const result = util.result

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[common]", () => {
    util.moveToWorkspace()

    beforeEach(util.removeResult)

    describe("should print a help text if arguments are nothing.", () => {
        it("npm-run-all command", async () => {
            const buf = new BufferStream()
            await util.runAll([], buf)
            assert(/Usage:/.test(buf.value))
        })

        it("run-s command", async () => {
            const buf = new BufferStream()
            await util.runSeq([], buf)
            assert(/Usage:/.test(buf.value))
        })

        it("run-p command", async () => {
            const buf = new BufferStream()
            await util.runPar([], buf)
            assert(/Usage:/.test(buf.value))
        })
    })

    describe("should print a help text if the first argument is --help (-h)", () => {
        it("npm-run-all command (-h)", async () => {
            const buf = new BufferStream()
            await util.runAll(["-h"], buf)
            assert(/Usage:/.test(buf.value))
        })

        it("run-s command (-h)", async () => {
            const buf = new BufferStream()
            await util.runSeq(["-h"], buf)
            assert(/Usage:/.test(buf.value))
        })

        it("run-p command (-h)", async () => {
            const buf = new BufferStream()
            await util.runPar(["-h"], buf)
            assert(/Usage:/.test(buf.value))
        })

        it("npm-run-all command (--help)", async () => {
            const buf = new BufferStream()
            await util.runAll(["--help"], buf)
            assert(/Usage:/.test(buf.value))
        })

        it("run-s command (--help)", async () => {
            const buf = new BufferStream()
            await util.runSeq(["--help"], buf)
            assert(/Usage:/.test(buf.value))
        })

        it("run-p command (--help)", async () => {
            const buf = new BufferStream()
            await util.runPar(["--help"], buf)
            assert(/Usage:/.test(buf.value))
        })
    })

    describe("should print a version number if the first argument is --version (-v)", () => {
        it("npm-run-all command (-v)", async () => {
            const buf = new BufferStream()
            await util.runAll(["-v"], buf)
            assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(buf.value))
        })

        it("run-s command (-v)", async () => {
            const buf = new BufferStream()
            await util.runSeq(["-v"], buf)
            assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(buf.value))
        })

        it("run-p command (-v)", async () => {
            const buf = new BufferStream()
            await util.runPar(["-v"], buf)
            assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(buf.value))
        })

        it("npm-run-all command (--version)", async () => {
            const buf = new BufferStream()
            await util.runAll(["--version"], buf)
            assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(buf.value))
        })

        it("run-s command (--version)", async () => {
            const buf = new BufferStream()
            await util.runSeq(["--version"], buf)
            assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(buf.value))
        })

        it("run-p command (--version)", async () => {
            const buf = new BufferStream()
            await util.runPar(["--version"], buf)
            assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(buf.value))
        })
    })

    describe("should do nothing if a task list is empty.", () => {
        it("Node API", async () => {
            await nodeApi(null)
            assert(result() == null)
        })
    })

    describe("should run a task by npm (check an environment variable):", () => {
        it("Node API", async () => {
            await nodeApi("test-task:package-config")
            assert(result() === "OK")
        })

        it("npm-run-all command", async () => {
            await util.runAll(["test-task:package-config"])
            assert(result() === "OK")
        })

        it("run-s command", async () => {
            await util.runSeq(["test-task:package-config"])
            assert(result() === "OK")
        })

        it("run-p command", async () => {
            await util.runPar(["test-task:package-config"])
            assert(result() === "OK")
        })
    })

    describe("stdin can be used in tasks:", () => {
        it("Node API", async () => {
            await nodeApi("test-task:stdin")
            assert(result().trim() === "STDIN")
        })

        it("npm-run-all command", async () => {
            await util.runAll(["test-task:stdin"])
            assert(result().trim() === "STDIN")
        })

        it("run-s command", async () => {
            await util.runSeq(["test-task:stdin"])
            assert(result().trim() === "STDIN")
        })

        it("run-p command", async () => {
            await util.runPar(["test-task:stdin"])
            assert(result().trim() === "STDIN")
        })
    })

    describe("stdout can be used in tasks:", () => {
        it("Node API", async () => {
            await nodeApi("test-task:stdout")
            assert(result() === "STDOUT")
        })

        it("npm-run-all command", async () => {
            await util.runAll(["test-task:stdout"])
            assert(result() === "STDOUT")
        })

        it("run-s command", async () => {
            await util.runSeq(["test-task:stdout"])
            assert(result() === "STDOUT")
        })

        it("run-p command", async () => {
            await util.runPar(["test-task:stdout"])
            assert(result() === "STDOUT")
        })
    })

    describe("stderr can be used in tasks:", () => {
        it("Node API", async () => {
            await nodeApi("test-task:stderr")
            assert(result() === "STDERR")
        })

        it("npm-run-all command", async () => {
            await util.runAll(["test-task:stderr"])
            assert(result() === "STDERR")
        })

        it("run-s command", async () => {
            await util.runSeq(["test-task:stderr"])
            assert(result() === "STDERR")
        })

        it("run-p command", async () => {
            await util.runPar(["test-task:stderr"])
            assert(result() === "STDERR")
        })
    })

    describe("should be able to use `restart` built-in task:", () => {
        it("Node API", () => nodeApi("restart"))
        it("npm-run-all command", () => util.runAll(["restart"]))
        it("run-s command", () => util.runSeq(["restart"]))
        it("run-p command", () => util.runPar(["restart"]))
    })

    describe("should be able to use `env` built-in task:", () => {
        it("Node API", () => nodeApi("env"))
        it("npm-run-all command", () => util.runAll(["env"]))
        it("run-s command", () => util.runSeq(["env"]))
        it("run-p command", () => util.runPar(["env"]))
    })

    if (process.platform === "win32") {
        describe("issue14", () => {
            it("Node API", () => nodeApi("test-task:issue14:win32"))
            it("npm-run-all command", () => util.runAll(["test-task:issue14:win32"]))
            it("run-s command", () => util.runSeq(["test-task:issue14:win32"]))
            it("run-p command", () => util.runPar(["test-task:issue14:win32"]))
        })
    }
    else {
        describe("issue14", () => {
            it("Node API", () => nodeApi("test-task:issue14:posix"))
            it("npm-run-all command", () => util.runAll(["test-task:issue14:posix"]))
            it("run-s command", () => util.runSeq(["test-task:issue14:posix"]))
            it("run-p command", () => util.runPar(["test-task:issue14:posix"]))
        })
    }

    describe("should not print log if silent option was given:", () => {
        it("Node API", async () => {
            const stdout = new BufferStream()
            const stderr = new BufferStream()
            try {
                await nodeApi("test-task:error", { silent: true, stdout, stderr })
            }
            catch (_err) {
                assert(stdout.value === "" && stderr.value === "")
                return
            }
            assert(false, "Should fail.")
        })

        /**
         * Strip unknown istanbul's warnings.
         * @param {string} str - The string to be stripped.
         * @returns {string} The stripped string.
         */
        function stripIstanbulWarnings(str) {
            return str.replace(/File \[.+?] ignored, nothing could be mapped\r?\n/, "")
        }

        it("npm-run-all command", async () => {
            const stdout = new BufferStream()
            const stderr = new BufferStream()
            try {
                await util.runAll(["--silent", "test-task:error"], stdout, stderr)
            }
            catch (_err) {
                assert(stdout.value === "" && stripIstanbulWarnings(stderr.value) === "")
                return
            }
            assert(false, "Should fail.")
        })

        it("run-s command", async () => {
            const stdout = new BufferStream()
            const stderr = new BufferStream()
            try {
                await util.runSeq(["--silent", "test-task:error"], stdout, stderr)
            }
            catch (_err) {
                assert(stdout.value === "" && stripIstanbulWarnings(stderr.value) === "")
                return
            }
            assert(false, "Should fail.")
        })

        it("run-p command", async () => {
            const stdout = new BufferStream()
            const stderr = new BufferStream()
            try {
                await util.runPar(["--silent", "test-task:error"], stdout, stderr)
            }
            catch (_err) {
                assert(stdout.value === "" && stripIstanbulWarnings(stderr.value) === "")
                return
            }
            assert(false, "Should fail.")
        })
    })

    // https://github.com/mysticatea/npm-run-all/issues/105
    describe("should not print MaxListenersExceededWarning when it runs 10 tasks:", () => {
        const tasks = Array.from({ length: 10 }, () => "test-task:dump x")

        it("npm-run-all command", async () => {
            const buf = new BufferStream()
            await util.runAll(["-p"].concat(tasks), null, buf)
            assert(buf.value.indexOf("MaxListenersExceededWarning") === -1)
        })

        it("run-s command", async () => {
            const buf = new BufferStream()
            await util.runSeq(tasks, null, buf)
            assert(buf.value.indexOf("MaxListenersExceededWarning") === -1)
        })

        it("run-p command", async () => {
            const buf = new BufferStream()
            await util.runPar(tasks, null, buf)
            assert(buf.value.indexOf("MaxListenersExceededWarning") === -1)
        })
    })
})
