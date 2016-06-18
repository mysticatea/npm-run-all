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

var Promise = require("pinkie-promise");
var NpmRunAllError = require("./npm-run-all-error");
var runTask = require("./run-task");

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
    var taskPromises = tasks.map(function (task) {
        return runTask(task, options);
    });
    var results = tasks.map(function (task) {
        return { name: task, code: undefined };
    });
    var aborted = false;

    /**
     * Aborts all tasks.
     * @returns {void}
     */
    function abortTasks() {
        if (!aborted && !options.continueOnError) {
            aborted = true;
            taskPromises.forEach(function (t) {
                return t.abort();
            });
        }
    }

    // When one of tasks exited with non-zero, abort all tasks.
    // And wait for all tasks exit.
    var errorResult = null;
    var parallelPromise = Promise.all(taskPromises.map(function (promise, index) {
        return promise.then(function (result) {
            // Save the result.
            if (!aborted) {
                results[index].code = result.code;
            }

            // Aborts all tasks if it's an error.
            if (errorResult == null && result.code) {
                errorResult = errorResult || result;
                abortTasks();
            }
        });
    }));
    parallelPromise.catch(abortTasks);

    // Make fail if there are tasks that exited non-zero.
    return parallelPromise.then(function () {
        if (errorResult != null) {
            throw new NpmRunAllError(errorResult, results);
        }
        return results;
    });
};