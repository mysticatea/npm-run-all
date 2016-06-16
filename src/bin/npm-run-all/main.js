/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const Promise = require("pinkie-promise");
const runAll = require("../../lib");
const parseCLIArgs = require("../common/parse-cli-args");

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
        const stdin = process.stdin;
        const {
            continueOnError,
            groups,
            packageConfig,
            printLabel,
            printName,
            silent,
            rest
        } = parseCLIArgs(args);

        return groups.reduce(
            (prev, {patterns, parallel}) => {
                if (patterns.length === 0) {
                    return prev;
                }
                return prev.then(() => runAll(
                    patterns,
                    {
                        stdout,
                        stderr,
                        stdin,
                        parallel,
                        continueOnError,
                        printLabel,
                        printName,
                        packageConfig,
                        silent,
                        rest
                    }
                ));
            },
            Promise.resolve(null)
        );
    }
    catch (err) {
        return Promise.reject(err);
    }
};
