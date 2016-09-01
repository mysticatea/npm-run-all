/**
 * @module index
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const Promise = require("pinkie-promise")
const shellQuote = require("shell-quote")
const matchTasks = require("./match-tasks")
const readPackageJson = require("./read-package-json")
const runTasksInParallel = require("./run-tasks-in-parallel")
const runTasksInSequencial = require("./run-tasks-in-sequencial")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const ARGS_PATTERN = /\{(!)?([*@]|\d+)([^}]+)?}/g

/**
 * Converts a given value to an array.
 *
 * @param {string|string[]|null|undefined} x - A value to convert.
 * @returns {string[]} An array.
 */
function toArray(x) {
    if (x == null) {
        return []
    }
    return Array.isArray(x) ? x : [x]
}

/**
 * Replaces argument placeholders (such as `{1}`) by arguments.
 *
 * @param {string[]} patterns - Patterns to replace.
 * @param {string[]} args - Arguments to replace.
 * @returns {string[]} replaced
 */
function applyArguments(patterns, args) {
    const defaults = Object.create(null)

    return patterns.map(pattern => pattern.replace(ARGS_PATTERN, (whole, indirectionMark, id, options) => {
        if (indirectionMark != null) {
            throw Error(`Invalid Placeholder: ${whole}`)
        }
        if (id === "@") {
            return shellQuote.quote(args)
        }
        if (id === "*") {
            return shellQuote.quote([args.join(" ")])
        }

        const position = parseInt(id, 10)
        if (position >= 1 && position <= args.length) {
            return shellQuote.quote([args[position - 1]])
        }

        // Address default values
        if (options != null) {
            const prefix = options.slice(0, 2)

            if (prefix === ":=") {
                defaults[id] = shellQuote.quote([options.slice(2)])
                return defaults[id]
            }
            if (prefix === ":-") {
                return shellQuote.quote([options.slice(2)])
            }

            throw Error(`Invalid Placeholder: ${whole}`)
        }
        if (defaults[id] != null) {
            return defaults[id]
        }

        return ""
    }))
}

/**
 * Parse patterns.
 * In parsing process, it replaces argument placeholders (such as `{1}`) by arguments.
 *
 * @param {string|string[]} patternOrPatterns - Patterns to run.
 *      A pattern is a npm-script name or a Glob-like pattern.
 * @param {string[]} args - Arguments to replace placeholders.
 * @returns {string[]} Parsed patterns.
 */
function parsePatterns(patternOrPatterns, args) {
    const patterns = toArray(patternOrPatterns)
    const hasPlaceholder = patterns.some(pattern => ARGS_PATTERN.test(pattern))

    return hasPlaceholder ? applyArguments(patterns, args) : patterns
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
    const options = []

    Object.keys(config).forEach(packageName => {
        const packageConfig = config[packageName]

        Object.keys(packageConfig).forEach(variableName => {
            const value = packageConfig[variableName]

            options.push(`--${packageName}:${variableName}=${value}`)
        })
    })

    return options
}

/**
 * Converts a given config object to an `--a=b` style option array.
 *
 * @param {object|null} config -
 *   A map-like object to set configs.
 * @returns {string[]} `--a=b` style options.
 */
function toConfigOptions(config) {
    return Object.keys(config).map(key => `--${key}=${config[key]}`)
}

/**
 * Gets the maximum length.
 *
 * @param {number} length - The current maximum length.
 * @param {string} name - A name.
 * @returns {number} The maximum length.
 */
function maxLength(length, name) {
    return Math.max(name.length, length)
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

// TODO(mysticatea): https://github.com/eslint/eslint/issues/6097
//eslint-disable-next-line valid-jsdoc
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
 * @param {boolean} options.continueOnError -
 *   The flag to ignore errors.
 *   Default is `false`.
 * @param {boolean} options.printLabel -
 *   The flag to print task names at the head of each line.
 *   Default is `false`.
 * @param {boolean} options.printName -
 *   The flag to print task names before running each task.
 *   Default is `false`.
 * @returns {Promise}
 *   A promise object which becomes fullfilled when all npm-scripts are completed.
 */
module.exports = function npmRunAll(
    patternOrPatterns,
    {
        parallel = false,
        stdin = null,
        stdout = null,
        stderr = null,
        taskList = null,
        config = null,
        packageConfig = null,
        silent = false,
        continueOnError = false,
        printLabel = false,
        printName = false,
        arguments: args = [],
        race = false,
    } = {}
) {
    try {
        const patterns = parsePatterns(patternOrPatterns, args)
        if (patterns.length === 0) {
            return Promise.resolve(null)
        }

        if (taskList != null && Array.isArray(taskList) === false) {
            throw new Error("Invalid options.taskList")
        }

        const prefixOptions = []
        if (silent) {
            prefixOptions.push("--silent")
        }
        if (packageConfig != null) {
            prefixOptions.push(...toOverwriteOptions(packageConfig))
        }
        if (config != null) {
            prefixOptions.push(...toConfigOptions(config))
        }

        return Promise.resolve(taskList)
            .then(taskList => {    // eslint-disable-line no-shadow
                if (taskList != null) {
                    return {taskList, packageInfo: null}
                }
                return readPackageJson()
            })
            .then(({taskList, packageInfo}) => {    // eslint-disable-line no-shadow
                const tasks = matchTasks(taskList, patterns)
                const labelWidth = tasks.reduce(maxLength, 0)
                const runTasks = parallel ? runTasksInParallel : runTasksInSequencial

                return runTasks(tasks, {
                    stdin,
                    stdout,
                    stderr,
                    prefixOptions,
                    continueOnError,
                    labelState: {
                        enabled: printLabel,
                        width: labelWidth,
                        lastPrefix: null,
                        lastIsLinebreak: true,
                    },
                    printName,
                    packageInfo,
                    race,
                })
            })
    }
    catch (err) {
        return Promise.reject(new Error(err.message))
    }
}
