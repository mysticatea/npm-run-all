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
    output.write("\nUsage:\n    $ run-s [--help | -h | --version | -v]\n    $ run-s [OPTIONS] <tasks>\n\n    Run given npm-scripts sequentially.\n\n    <tasks> : A list of npm-scripts' names and Glob-like patterns.\n\nOptions:\n    -c, --continue-on-error  - Set the flag to continue executing subsequent\n                               tasks even if a task threw an error. 'run-s'\n                               itself will exit with non-zero code if one or\n                               more tasks threw error(s).\n    -l, --print-label  - - - - Set the flag to print the task name as a prefix\n                               on each line of output. Tools in tasks may stop\n                               coloring their output if this option was given.\n    -n, --print-name   - - - - Set the flag to print the task name before\n                               running each task.\n    -s, --silent   - - - - - - Set 'silent' to the log level of npm.\n\n    Shorthand aliases can be combined.\n    For example, '-clns' equals to '-c -l -n -s'.\n\nExamples:\n    $ run-s build:**\n    $ run-s lint clean build:**\n    $ run-s --silent --print-name lint clean build:**\n    $ run-s -sn lint clean build:**\n\nSee Also:\n    https://github.com/mysticatea/npm-run-all#readme\n");

    return Promise.resolve(null);
};