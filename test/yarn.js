/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const spawn = require("cross-spawn")
const assert = require("power-assert")
const BufferStream = require("./lib/buffer-stream")
const util = require("./lib/util")
const result = util.result
const removeResult = util.removeResult

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Execute a command.
 * @param {string} command A command to execute.
 * @param {string[]} args Arguments for the command.
 * @returns {Promise<string>} The result of child process's stdout.
 */
function exec(command, args) {
    return new Promise((resolve, reject) => {
        const stdout = new BufferStream()
        const stderr = new BufferStream()
        const cp = spawn(command, args, { stdio: ["inherit", "pipe", "pipe"] })

        cp.stdout.pipe(stdout)
        cp.stderr.pipe(stderr)
        cp.on("exit", (exitCode) => {
            if (exitCode) {
                reject(new Error(`Exited with ${exitCode}: ${stderr.value}`))
                return
            }
            resolve(stdout.value)
        })
        cp.on("error", reject)
    })
}

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[yarn]", () => {
    before(() => process.chdir("test-workspace"))
    after(() => process.chdir(".."))

    beforeEach(removeResult)

    describe("'yarn run' command", () => {
        it("should run 'npm-run-all' in scripts with yarn.", async () => {
            const stdout = await exec("yarn", ["run", "test-task:yarn"])
            const matches = stdout.match(/^\$ node .+$/gm)
            assert(result() === "aabb")
            assert(matches.length === 3)
        })
    })
})
