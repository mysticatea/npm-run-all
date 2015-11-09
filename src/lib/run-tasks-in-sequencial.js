/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
import runTask from "./run-task";

const START_PROMISE = Promise.resolve({code: 0});

/**
 * Throws an error if a given result indicates non-zero exit.
 *
 * @param {{task: string, code: number}} result - A result object.
 * @returns {void}
 */
function rejectIfNonZeroExit(result) {
    if (result.code) {
        throw new Error(`${result.task}: None-Zero Exit(${result.code});`);
    }
}

/**
 * Run npm-scripts of given names in sequencial.
 *
 * If a npm-script exited with a non-zero code, this aborts subsequent npm-scripts.
 *
 * @param {string} tasks - A list of npm-script name to run in sequencial.
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
 * @returns {Promise}
 *   A promise object which becomes fullfilled when all npm-scripts are completed.
 * @private
 */
export default function runTasksInSequencial(tasks, stdin, stdout, stderr) {
    return tasks.reduce(
        (prev, task) => prev.then(result => {
            rejectIfNonZeroExit(result);
            return runTask(task, stdin, stdout, stderr);
        }),
        START_PROMISE
    ).then(rejectIfNonZeroExit);
}
