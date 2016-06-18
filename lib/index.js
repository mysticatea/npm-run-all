/**
 * @module index
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Promise = require("pinkie-promise");
var shellQuote = require("shell-quote");
var matchTasks = require("./match-tasks");
var readPackageJson = require("./read-package-json");
var runTasksInParallel = require("./run-tasks-in-parallel");
var runTasksInSequencial = require("./run-tasks-in-sequencial");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

var ARGS_PATTERN = /[{]([*@]|\d+)[}]/g;

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
 * Replaces argument placeholders (such as `{1}`) by arguments.
 *
 * @param {string[]} patterns - Patterns to replace.
 * @param {string[]} args - Arguments to replace.
 * @returns {string[]} replaced
 */
function applyArguments(patterns, args) {
    return patterns.map(function (pattern) {
        return pattern.replace(ARGS_PATTERN, function (match, index) {
            if (index === "@") {
                return shellQuote.quote(args);
            }
            if (index === "*") {
                return shellQuote.quote([args.join(" ")]);
            }

            var position = parseInt(index, 10);
            if (position >= 1 && position <= args.length) {
                return shellQuote.quote([args[position - 1]]);
            }

            return match;
        });
    });
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
    var patterns = toArray(patternOrPatterns);
    var hasArguments = Array.isArray(args) && args.length > 0;

    return hasArguments ? applyArguments(patterns, args) : patterns;
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
    var options = [];

    Object.keys(config).forEach(function (packageName) {
        var packageConfig = config[packageName];

        Object.keys(packageConfig).forEach(function (variableName) {
            var value = packageConfig[variableName];

            options.push("--" + packageName + ":" + variableName + "=" + value);
        });
    });

    return options;
}

/**
 * Gets the maximum length.
 *
 * @param {number} length - The current maximum length.
 * @param {string} name - A name.
 * @returns {number} The maximum length.
 */
function maxLength(length, name) {
    return Math.max(name.length, length);
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
 * @param {string} options.packageJsonFolder -
 *   Position of package.json
 *   Default is process.cwd().
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
module.exports = function npmRunAll(patternOrPatterns) {
    var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var _ref$parallel = _ref.parallel;
    var parallel = _ref$parallel === undefined ? false : _ref$parallel;
    var _ref$stdin = _ref.stdin;
    var stdin = _ref$stdin === undefined ? null : _ref$stdin;
    var _ref$stdout = _ref.stdout;
    var stdout = _ref$stdout === undefined ? null : _ref$stdout;
    var _ref$stderr = _ref.stderr;
    var stderr = _ref$stderr === undefined ? null : _ref$stderr;
    var _ref$taskList = _ref.taskList;
    var taskList = _ref$taskList === undefined ? null : _ref$taskList;
    var _ref$packageConfig = _ref.packageConfig;
    var packageConfig = _ref$packageConfig === undefined ? null : _ref$packageConfig;
    var _ref$packageJsonFolde = _ref.packageJsonFolder;
    var packageJsonFolder = _ref$packageJsonFolde === undefined ? process.cwd() : _ref$packageJsonFolde;
    var _ref$silent = _ref.silent;
    var silent = _ref$silent === undefined ? false : _ref$silent;
    var _ref$continueOnError = _ref.continueOnError;
    var continueOnError = _ref$continueOnError === undefined ? false : _ref$continueOnError;
    var _ref$printLabel = _ref.printLabel;
    var printLabel = _ref$printLabel === undefined ? false : _ref$printLabel;
    var _ref$printName = _ref.printName;
    var printName = _ref$printName === undefined ? false : _ref$printName;
    var _ref$arguments = _ref.arguments;
    var args = _ref$arguments === undefined ? [] : _ref$arguments;

    try {
        var _ret = function () {
            var patterns = parsePatterns(patternOrPatterns, args);
            if (patterns.length === 0) {
                return {
                    v: Promise.resolve(null)
                };
            }

            if (taskList != null && Array.isArray(taskList) === false) {
                throw new Error("Invalid options.taskList");
            }

            var prefixOptions = [];
            if (silent) {
                prefixOptions.push("--silent");
            }
            if (packageConfig != null) {
                prefixOptions.push.apply(prefixOptions, _toConsumableArray(toOverwriteOptions(packageConfig)));
            }

            return {
                v: Promise.resolve(taskList).then(function (taskList) {
                    // eslint-disable-line no-shadow
                    if (taskList != null) {
                        return { taskList: taskList, packageInfo: null };
                    }
                    return readPackageJson(packageJsonFolder);
                }).then(function (_ref2) {
                    var taskList = _ref2.taskList;
                    var packageInfo = _ref2.packageInfo;
                    // eslint-disable-line no-shadow
                    var tasks = matchTasks(taskList, patterns);
                    var labelWidth = tasks.reduce(maxLength, 0);
                    var runTasks = parallel ? runTasksInParallel : runTasksInSequencial;

                    return runTasks(tasks, {
                        stdin: stdin,
                        stdout: stdout,
                        stderr: stderr,
                        prefixOptions: prefixOptions,
                        continueOnError: continueOnError,
                        labelState: {
                            enabled: printLabel,
                            width: labelWidth,
                            lastPrefix: null,
                            lastIsLinebreak: true
                        },
                        printName: printName,
                        packageInfo: packageInfo
                    });
                })
            };
        }();

        if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
    } catch (err) {
        return Promise.reject(new Error(err.message));
    }
};