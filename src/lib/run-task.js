/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import chalk from "chalk";
import {parse as parseArgs} from "shell-quote";
import padEnd from "string.prototype.padend";
import createPrefixTransform from "./create-prefix-transform-stream";
import spawn from "./spawn";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Pass through the argument.
 *
 * @param {string} s - An argument.
 * @returns {string} The argument.
 */
function identity(s) {
    return s;
}

/**
 * Wraps stdout/stderr with a transform stream to add the task name as prefix.
 *
 * @param {string} taskName - The task name.
 * @param {stream.Writable} source - An output stream to be wrapped.
 * @param {stream.Writable} std - process.stdout/process.stderr.
 * @param {object} labelState - An label state for the transform stream.
 * @returns {stream.Writable} `source` or the created wrapped stream.
 */
function wrapLabeling(taskName, source, std, labelState) {
    if (source == null || !labelState.enabled) {
        return source;
    }

    const label = padEnd(taskName, labelState.width);
    const color = (source === std) ? chalk.gray : identity;
    const prefix = color(`[${label}] `);
    const stream = createPrefixTransform(prefix, labelState);

    stream.pipe(source);

    return stream;
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
    );
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
 * @returns {Promise}
 *   A promise object which becomes fullfilled when the npm-script is completed.
 *   This promise object has an extra method: `abort()`.
 * @private
 */
export default function runTask(
    task,
    {
        stdin,
        stdout: sourceStdout,
        stderr: sourceStderr,
        prefixOptions,
        labelState
    }
) {
    let cp = null;
    const promise = new Promise((resolve, reject) => {
        const stdout = wrapLabeling(task, sourceStdout, process.stdout, labelState);
        const stderr = wrapLabeling(task, sourceStderr, process.stderr, labelState);
        const stdinKind = detectStreamKind(stdin, process.stdin);
        const stdoutKind = detectStreamKind(stdout, process.stdout);
        const stderrKind = detectStreamKind(stderr, process.stderr);

        // Execute.
        cp = spawn(
            "npm",
            ["run-script"].concat(prefixOptions, parseArgs(task)),
            {stdio: [stdinKind, stdoutKind, stderrKind]}
        );

        // Piping stdio.
        if (stdinKind === "pipe") { stdin.pipe(cp.stdin); }
        if (stdoutKind === "pipe") { cp.stdout.pipe(stdout, {end: false}); }
        if (stderrKind === "pipe") { cp.stderr.pipe(stderr, {end: false}); }

        // Register
        cp.on("error", (err) => {
            cp = null;
            reject(err);
        });
        cp.on("close", (code) => {
            cp = null;
            resolve({task, code});
        });
    });

    promise.abort = function abort() {
        if (cp != null) {
            cp.kill();
            cp = null;
        }
    };

    return promise;
}
