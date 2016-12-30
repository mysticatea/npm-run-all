/**
 * @module run-tasks-in-parallel
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const NpmRunAllError = require("./npm-run-all-error")
const runTask = require("./run-task")

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
    const taskPromises = tasks.map(task => runTask(task, options))
    const results = tasks.map(task => ({name: task, code: undefined}))
    let aborted = false

    /**
     * Aborts all tasks.
     * @returns {void}
     */
    function abortTasks() {
        aborted = true
        taskPromises.forEach(t => t.abort())
    }

    // When one of tasks exited with non-zero, abort all tasks.
    // And wait for all tasks exit.
    let errorResult = null
    const parallelPromise = Promise.all(taskPromises.map((promise, index) =>
        promise.then(result => {
            if (aborted) {
                return
            }

            // Save the result.
            results[index].code = result.code

            // Aborts all tasks if it's an error.
            if (errorResult == null && result.code) {
                errorResult = errorResult || result
                if (!options.continueOnError) {
                    abortTasks()
                }
            }

            // Aborts all tasks if options.race is true.
            if (options.race && !result.code) {
                abortTasks()
            }
        })
    ))
    parallelPromise.catch(() => {
        if (!aborted && !options.continueOnError) {
            abortTasks()
        }
    })

    // Make fail if there are tasks that exited non-zero.
    return parallelPromise.then(() => {
        if (errorResult != null) {
            throw new NpmRunAllError(errorResult, results)
        }
        return results
    })
}
