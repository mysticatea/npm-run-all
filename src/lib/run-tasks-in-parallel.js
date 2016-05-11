/**
 * @module run-tasks-in-parallel
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const runTask = require("./run-task");

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Run npm-scripts of given names in parallel.
 *
 * If a npm-script exited with a non-zero code, this aborts other all npm-scripts.
 *
 * @param {string} tasks - A list of npm-script name to run in parallel.
 * @param {object} options - An option object.
 * @returns {Promise} A promise object which becomes fullfilled when all npm-scripts are completed.
 * @private
 */
module.exports = function runTasksInParallel(tasks, options) {
    const taskPromises = tasks.map(task => runTask(task, options));
    if (options.continueOnError) {
        return Promise.all(taskPromises);
    }

    // When one of tasks exited with non-zero, abort all tasks.
    // And wait for all tasks exit.
    let nonZeroExited = null;
    const parallelPromise = Promise.all(taskPromises.map(p =>
        p.then(item => {
            if (nonZeroExited == null && item.code) {
                nonZeroExited = nonZeroExited || item;
                taskPromises.forEach(t => t.abort());
            }
        })
    ));
    parallelPromise.catch(() => {
        taskPromises.forEach(t => t.abort());
    });

    // Make fail if there are tasks that exited non-zero.
    return parallelPromise.then(() => {
        if (nonZeroExited != null) {
            throw new Error(
                `${nonZeroExited.task}: None-Zero Exit(${nonZeroExited.code});`
            );
        }
    });
};
