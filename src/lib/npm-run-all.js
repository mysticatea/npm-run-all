/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
import matchTasks from "./match-tasks";
import readTasks from "./read-tasks";
import runTasksInParallel from "./run-tasks-in-parallel";
import runTasksInSequencial from "./run-tasks-in-sequencial";
import runTasksInWaterfall from "./run-tasks-in-waterfall";

const runTasks = {
    sequencial: runTasksInSequencial,
    parallel: runTasksInParallel,
    waterfall: runTasksInWaterfall
};
const validTypes = Object.keys(runTasks);

/**
 * Parses the type from options.
 *
 * @param {object|undefined} options - An options object to parse.
 * @returns {string} The value of `options.type`.
 *      If it's nothing, `"sequencial"`.
 *      If `options.parallel` is true, `"parallel"` for backword compatibility.
 */
function parseType(options) {
    if (options == null) {
        return "sequencial";
    }
    if (options.parallel) {
        return "parallel";
    }
    return options.type || "sequencial";
}

/**
 * Converts a given value to an array.
 *
 * @param {string|string[]|null|undefined} x - A value to convert.
 * @returns {string[]} An array.
 */
function toArray(x) {
    if (x == null) {
        return [];
    }
    return Array.isArray(x) ? x : [x];
}

/**
 * Converts a given config object to an `--:=` style option array.
 *
 * @param {object|null} config -
 *   A map-like object to overwrite package configs.
 *   Keys are package names.
 *   Every value is a map-like object (Pairs of variable name and value).
 * @returns {string[]} `--:=` style options.
 */
function toOverwriteOptions(config) {
    const options = [];

    for (const packageName of Object.keys(config)) {
        const packageConfig = config[packageName];

        for (const variableName of Object.keys(packageConfig)) {
            const value = packageConfig[variableName];

            options.push(`--${packageName}:${variableName}=${value}`);
        }
    }

    return options;
}

/**
 * Runs npm-scripts which are matched with given patterns.
 *
 * @param {string|string[]} patternOrPatterns - Patterns to run.
 *   A pattern is a npm-script name or a Glob-like pattern.
 * @param {object|undefined} [options] Optional.
 * @param {boolean} options.parallel -
 *   If this is `true`, run scripts in parallel.
 *   Otherwise, run scripts in sequencial.
 *   Default is `false`.
 * @param {stream.Readable|null} options.stdin -
 *   A readable stream to send messages to stdin of child process.
 *   If this is `null`, ignores it.
 *   If this is `process.stdin`, inherits it.
 *   Otherwise, makes a pipe.
 *   Default is `null`.
 * @param {stream.Writable|null} options.stdout -
 *   A writable stream to receive messages from stdout of child process.
 *   If this is `null`, cannot send.
 *   If this is `process.stdout`, inherits it.
 *   Otherwise, makes a pipe.
 *   Default is `null`.
 * @param {stream.Writable|null} options.stderr -
 *   A writable stream to receive messages from stderr of child process.
 *   If this is `null`, cannot send.
 *   If this is `process.stderr`, inherits it.
 *   Otherwise, makes a pipe.
 *   Default is `null`.
 * @param {string[]} options.taskList -
 *   Actual name list of npm-scripts.
 *   This function search npm-script names in this list.
 *   If this is `null`, this function reads `package.json` of current directly.
 * @param {object|null} options.packageConfig -
 *   A map-like object to overwrite package configs.
 *   Keys are package names.
 *   Every value is a map-like object (Pairs of variable name and value).
 *   e.g. `{"npm-run-all": {"test": 777}}`
 *   Default is `null`.
 * @param {boolean} options.silent -
 *   The flag to set `silent` to the log level of npm.
 *   Default is `false`.
 * @returns {Promise}
 *   A promise object which becomes fullfilled when all npm-scripts are completed.
 */
export default function npmRunAll(patternOrPatterns, options) {
    try {
        const type = parseType(options);
        if (validTypes.indexOf(type) === -1) {
            throw new Error("'options.type' is invalid.");
        }

        const patterns = toArray(patternOrPatterns);
        if (patterns.length === 0) {
            return Promise.resolve(null);
        }

        const {
            stdin = null,
            stdout = null,
            stderr = null,
            taskList = null,
            packageConfig = null,
            silent = false
        } = options || {};
        if (taskList != null && Array.isArray(taskList) === false) {
            throw new Error("Invalid options.taskList");
        }

        const tasks = matchTasks(taskList || readTasks(), patterns);
        const prefixOptions = [];
        if (silent || type === "waterfall") {
            prefixOptions.push("--silent");
        }
        if (packageConfig != null) {
            prefixOptions.push(...toOverwriteOptions(packageConfig));
        }

        return runTasks[type](tasks, stdin, stdout, stderr, prefixOptions);
    }
    catch (err) {
        return Promise.reject(new Error(err.message));
    }
}
