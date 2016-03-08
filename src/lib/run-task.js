/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
import {parse as parseArgs} from "shell-quote";
import spawn from "./spawn";

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
        stream !== std ? "pipe" :
        /* else */ stream
    );
}

/**
 * Run a npm-script of a given name.
 * The return value is a promise which has an extra method: `abort()`.
 * The `abort()` kills the child process to run the npm-script.
 *
 * @param {string} task - A npm-script name to run.
 * @param {stream.Readable|null} stdin -
 *   A readable stream to send messages to stdin of child process.
 *   If this is `null`, ignores it.
 *   If this is `process.stdin`, inherits it.
 *   Otherwise, makes a pipe.
 * @param {stream.Writable|null} stdout -
 *   A writable stream to receive messages from stdout of child process.
 *   If this is `null`, cannot send.
 *   If this is `process.stdout`, inherits it.
 *   Otherwise, makes a pipe.
 * @param {stream.Writable|null} stderr -
 *   A writable stream to receive messages from stderr of child process.
 *   If this is `null`, cannot send.
 *   If this is `process.stderr`, inherits it.
 *   Otherwise, makes a pipe.
 * @param {string[]} prefixOptions -
 *   An array of options which are inserted before the task name.
 * @returns {Promise}
 *   A promise object which becomes fullfilled when the npm-script is completed.
 *   This promise object has an extra method: `abort()`.
 * @private
 */
export default function runTask(task, stdin, stdout, stderr, prefixOptions) {
    let cp = null;
    const promise = new Promise((resolve, reject) => {
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
        if (stdoutKind === "pipe") { cp.stdout.pipe(stdout); }
        if (stderrKind === "pipe") { cp.stderr.pipe(stderr); }

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
