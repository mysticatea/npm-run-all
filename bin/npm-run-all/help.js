/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var Promise = require("pinkie-promise");

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Print a help text.
 *
 * @param {stream.Writable} output - A writable stream to print.
 * @returns {Promise} Always a fulfilled promise.
 * @private
 */
module.exports = function printHelp(output) {
    output.write("\nUsage:\n    $ npm-run-all [--help | -h | --version | -v]\n    $ npm-run-all [tasks] [OPTIONS]\n\n    Run given npm-scripts in parallel or sequential.\n\n    <tasks> : A list of npm-scripts' names and Glob-like patterns.\n\nOptions:\n    -c, --continue-on-error  - Set the flag to continue executing\n                               other/subsequent tasks even if a task threw an\n                               error. 'npm-run-all' itself will exit with\n                               non-zero code if one or more tasks threw error(s)\n    -l, --print-label  - - - - Set the flag to print the task name as a prefix\n                               on each line of output. Tools in tasks may stop\n                               coloring their output if this option was given.\n    -n, --print-name   - - - - Set the flag to print the task name before\n                               running each task.\n    -p, --parallel <tasks>   - Run a group of tasks in parallel.\n                               e.g. 'npm-run-all -p foo bar' is similar to\n                                    'npm run foo & npm run bar'.\n    -s, --sequential <tasks> - Run a group of tasks sequentially.\n        --serial <tasks>       e.g. 'npm-run-all -s foo bar' is similar to\n                                    'npm run foo && npm run bar'.\n                               '--serial' is a synonym of '--sequential'.\n    --silent   - - - - - - - - Set 'silent' to the log level of npm.\n\nExamples:\n    $ npm-run-all --serial clean lint build:**\n    $ npm-run-all --parallel watch:**\n    $ npm-run-all clean lint --parallel \"build:** -- --watch\"\n    $ npm-run-all -l -p start-server start-browser start-electron\n\nSee Also:\n    https://github.com/mysticatea/npm-run-all#readme\n");

    return Promise.resolve(null);
};