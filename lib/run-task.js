/**
 * @module run-task
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const path = require("path")
const chalk = require("chalk")
const parseArgs = require("shell-quote").parse
const padEnd = require("string.prototype.padend")
const createHeader = require("./create-header")
const createPrefixTransform = require("./create-prefix-transform-stream")
const spawn = require("./spawn")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const colors = [chalk.cyan, chalk.green, chalk.magenta, chalk.yellow, chalk.red]

/**
 * Select a color from given task name.
 *
 * @param {string} taskName - The task name.
 * @returns {function} A colorize function that provided by `chalk`
 */
function selectColor(taskName) {
    let hash = 0

    for (const c of taskName) {
        hash = ((hash << 5) - hash) + c
        hash |= 0
    }

    return colors[Math.abs(hash) % colors.length]
}

/**
 * Wraps stdout/stderr with a transform stream to add the task name as prefix.
 *
 * @param {string} taskName - The task name.
 * @param {stream.Writable} source - An output stream to be wrapped.
 * @param {object} labelState - An label state for the transform stream.
 * @returns {stream.Writable} `source` or the created wrapped stream.
 */
function wrapLabeling(taskName, source, labelState) {
    if (source == null || !labelState.enabled) {
        return source
    }

    const label = padEnd(taskName, labelState.width)
    const color = source.isTTY ? selectColor(taskName) : (x) => x
    const prefix = color(`[${label}] `)
    const stream = createPrefixTransform(prefix, labelState)

    stream.pipe(source)

    return stream
}

/**
 * Converts a given stream to an option for `child_process.spawn`.
 *
 * @param {stream.Readable|stream.Writable|null} stream - An original stream to convert.
 * @param {process.stdin|process.stdout|process.stderr} std - A standard stream for this option.
 * @returns {string|stream.Readable|stream.Writable} An option for `child_process.spawn`.
 */
function detectStreamKind(stream, std) {
    return (
        stream == null ? "ignore" :
        // `|| !std.isTTY` is needed for the workaround of https://github.com/nodejs/node/issues/5620
        stream !== std || !std.isTTY ? "pipe" :
        /* else */ stream
    )
}

/**
 * Create spawnArgs for running a task.
 *
 * @param {string|undefined} npmPath any available npmPath
 * @param {string} task the run-script to execute, or "install"
 * @param {object} prefixOptions options for spawn
 * @returns {Array.<*>} args for spawn
 */
function createSpawnArgs(npmPath, task, prefixOptions) {
    if (task === "install") {
        return [].concat(
            npmPath ? [npmPath, "install"] : ["install"],
            prefixOptions
        )
    }

    return [].concat(
        npmPath ? [npmPath, "run"] : ["run"],
        prefixOptions,
        parseArgs(task)
    )
}
//------------------------------------------------------------------------------
// Interface
//------------------------------------------------------------------------------

/**
 * Run a npm-script of a given name.
 * The return value is a promise which has an extra method: `abort()`.
 * The `abort()` kills the child process to run the npm-script.
 *
 * @param {string} task - A npm-script name to run.
 * @param {object} options - An option object.
 * @param {stream.Readable|null} options.stdin -
 *   A readable stream to send messages to stdin of child process.
 *   If this is `null`, ignores it.
 *   If this is `process.stdin`, inherits it.
 *   Otherwise, makes a pipe.
 * @param {stream.Writable|null} options.stdout -
 *   A writable stream to receive messages from stdout of child process.
 *   If this is `null`, cannot send.
 *   If this is `process.stdout`, inherits it.
 *   Otherwise, makes a pipe.
 * @param {stream.Writable|null} options.stderr -
 *   A writable stream to receive messages from stderr of child process.
 *   If this is `null`, cannot send.
 *   If this is `process.stderr`, inherits it.
 *   Otherwise, makes a pipe.
 * @param {string[]} options.prefixOptions -
 *   An array of options which are inserted before the task name.
 * @param {object} options.labelState - A state object for printing labels.
 * @param {boolean} options.printName - The flag to print task names before running each task.
 * @returns {Promise}
 *   A promise object which becomes fullfilled when the npm-script is completed.
 *   This promise object has an extra method: `abort()`.
 * @private
 */
module.exports = function runTask(task, options) {
    let cp = null
    const promise = new Promise((resolve, reject) => {
        const stdin = options.stdin
        const stdout = wrapLabeling(task, options.stdout, options.labelState)
        const stderr = wrapLabeling(task, options.stderr, options.labelState)
        const stdinKind = detectStreamKind(stdin, process.stdin)
        const stdoutKind = detectStreamKind(stdout, process.stdout)
        const stderrKind = detectStreamKind(stderr, process.stderr)
        const spawnOptions = { stdio: [stdinKind, stdoutKind, stderrKind] }

        // Print task name.
        if (options.printName && stdout != null) {
            stdout.write(createHeader(
                task,
                options.packageInfo,
                options.stdout.isTTY
            ))
        }

        if (path.extname(options.npmPath || "a.js") === ".js") {
            const npmPath = options.npmPath || process.env.npm_execpath  //eslint-disable-line no-process-env
            const execPath = npmPath ? process.execPath : "npm"
            const spawnArgs = createSpawnArgs(npmPath, task, options.prefixOptions)

            // Execute.
            cp = spawn(execPath, spawnArgs, spawnOptions)
        }
        else {
            const execPath = options.npmPath
            const spawnArgs = createSpawnArgs(undefined, task, options.prefixOptions)

            // Execute.
            cp = spawn(execPath, spawnArgs, spawnOptions)
        }

        // Piping stdio.
        if (stdinKind === "pipe") {
            stdin.pipe(cp.stdin)
        }
        if (stdoutKind === "pipe") {
            cp.stdout.pipe(stdout, { end: false })
        }
        if (stderrKind === "pipe") {
            cp.stderr.pipe(stderr, { end: false })
        }

        // Register
        cp.on("error", (err) => {
            cp = null
            reject(err)
        })
        cp.on("close", (code) => {
            cp = null
            resolve({ task, code })
        })
    })

    promise.abort = function abort() {
        if (cp != null) {
            cp.kill()
            cp = null
        }
    }

    return promise
}
