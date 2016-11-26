/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

/*eslint-disable no-var, prefer-arrow-callback*/

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var cp = require("child_process")
var fs = require("fs")
var path = require("path")
var Promise = require("pinkie-promise")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

var FILE_NAME = "test.txt"
var NPM_RUN_ALL = path.resolve(__dirname, "../../src/bin/npm-run-all/index.js")
var RUN_P = path.resolve(__dirname, "../../src/bin/run-p/index.js")
var RUN_S = path.resolve(__dirname, "../../src/bin/run-s/index.js")

/**
 * Spawns the given script with the given arguments.
 *
 * @param {string} filePath - The file path to be executed.
 * @param {string[]} args - The arguments to execute.
 * @param {Writable} [stdout] - The writable stream to receive stdout.
 * @param {Writable} [stderr] - The writable stream to receive stderr.
 * @returns {Promise<void>} The promise which becomes fulfilled if the child
 *  process finished.
 */
function spawn(filePath, args, stdout, stderr) {
    return new Promise(function(resolve, reject) {
        var child = cp.spawn(
            process.execPath,
            [filePath].concat(args),
            {stdio: "pipe"}
        )

        if (stdout != null) {
            child.stdout.pipe(stdout)
        }
        if (stderr != null) {
            child.stderr.pipe(stderr)
        }
        child.on("close", (exitCode) => {
            if (exitCode) {
                reject(new Error("Exited with non-zero code."))
            }
            else {
                resolve()
            }
        })
        child.on("error", reject)
    })
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Gets the result text from `test.txt`.
 *
 * @returns {string|null} The result text.
 */
exports.result = function result() {
    try {
        return fs.readFileSync(FILE_NAME, {encoding: "utf8"})
    }
    catch (err) {
        if (err.message.indexOf("ENOENT") < 0) {
            console.error("ERROR:", err.stack)
        }
        return null
    }
}

/**
 * Appends text to `test.txt`.
 *
 * @param {string} content - A text to append.
 * @returns {void}
 */
exports.appendResult = function appendResult(content) {
    fs.appendFileSync(FILE_NAME, content)
}

/**
 * Removes `test.txt`.
 *
 * @returns {void}
 */
exports.removeResult = function removeResult() {
    try {
        fs.unlinkSync(FILE_NAME)
    }
    catch (err) {
        if (err.message.indexOf("ENOENT") < 0) {
            console.error("ERROR:", err.stack)
        }
    }
}

/**
 * Delay.
 *
 * @param {number} timeoutInMillis - The time to delay.
 * @returns {Promise<void>} The promise which fulfilled after the given time.
 */
exports.delay = function delay(timeoutInMillis) {
    return new Promise(function(resolve) {
        setTimeout(resolve, timeoutInMillis)
    })
}

/**
 * Executes `npm-run-all` with the given arguments.
 *
 * @param {string[]} args - The arguments to execute.
 * @param {Writable} [stdout] - The writable stream to receive stdout.
 * @param {Writable} [stderr] - The writable stream to receive stderr.
 * @returns {Promise<void>} The promise which becomes fulfilled if the child
 *  process finished.
 */
exports.runAll = function runAll(args, stdout, stderr) {
    return spawn(NPM_RUN_ALL, args, stdout, stderr)
}

/**
 * Executes `run-p` with the given arguments.
 *
 * @param {string[]} args - The arguments to execute.
 * @param {Writable} [stdout] - The writable stream to receive stdout.
 * @param {Writable} [stderr] - The writable stream to receive stderr.
 * @returns {Promise<void>} The promise which becomes fulfilled if the child
 *  process finished.
 */
exports.runPar = function runPar(args, stdout, stderr) {
    return spawn(RUN_P, args, stdout, stderr)
}

/**
 * Executes `run-s` with the given arguments.
 *
 * @param {string[]} args - The arguments to execute.
 * @param {Writable} [stdout] - The writable stream to receive stdout.
 * @param {Writable} [stderr] - The writable stream to receive stderr.
 * @returns {Promise<void>} The promise which becomes fulfilled if the child
 *  process finished.
 */
exports.runSeq = function runSeq(args, stdout, stderr) {
    return spawn(RUN_S, args, stdout, stderr)
}
