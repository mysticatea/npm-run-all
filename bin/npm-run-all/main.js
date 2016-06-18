/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var Promise = require("pinkie-promise");
var runAll = require("../../lib");
var parseCLIArgs = require("../common/parse-cli-args");

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Parses arguments, then run specified npm-scripts.
 *
 * @param {string[]} args - Arguments to parse.
 * @param {stream.Writable} stdout - A writable stream to print logs.
 * @param {stream.Writable} stderr - A writable stream to print errors.
 * @returns {Promise} A promise which comes to be fulfilled when all npm-scripts are completed.
 * @private
 */
module.exports = function npmRunAll(args, stdout, stderr) {
    try {
        var _ret = function () {
            var stdin = process.stdin;

            var _parseCLIArgs = parseCLIArgs(args);

            var continueOnError = _parseCLIArgs.continueOnError;
            var groups = _parseCLIArgs.groups;
            var packageConfig = _parseCLIArgs.packageConfig;
            var printLabel = _parseCLIArgs.printLabel;
            var printName = _parseCLIArgs.printName;
            var silent = _parseCLIArgs.silent;
            var rest = _parseCLIArgs.rest;


            return {
                v: groups.reduce(function (prev, _ref) {
                    var patterns = _ref.patterns;
                    var parallel = _ref.parallel;

                    if (patterns.length === 0) {
                        return prev;
                    }
                    return prev.then(function () {
                        return runAll(patterns, {
                            stdout: stdout,
                            stderr: stderr,
                            stdin: stdin,
                            parallel: parallel,
                            continueOnError: continueOnError,
                            printLabel: printLabel,
                            printName: printName,
                            packageConfig: packageConfig,
                            silent: silent,
                            arguments: rest
                        });
                    });
                }, Promise.resolve(null))
            };
        }();

        if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
    } catch (err) {
        return Promise.reject(err);
    }
};