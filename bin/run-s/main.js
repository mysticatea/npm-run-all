/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

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
        var stdin = process.stdin;

        var _parseCLIArgs = parseCLIArgs(args, { parallel: false }, { singleMode: true });

        var _parseCLIArgs$lastGro = _parseCLIArgs.lastGroup;
        var patterns = _parseCLIArgs$lastGro.patterns;
        var parallel = _parseCLIArgs$lastGro.parallel;
        var continueOnError = _parseCLIArgs.continueOnError;
        var packageConfig = _parseCLIArgs.packageConfig;
        var printLabel = _parseCLIArgs.printLabel;
        var printName = _parseCLIArgs.printName;
        var silent = _parseCLIArgs.silent;
        var rest = _parseCLIArgs.rest;


        if (patterns.length === 0) {
            return Promise.resolve(null);
        }

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
    } catch (err) {
        return Promise.reject(err);
    }
};