/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import parseCLIArgs from "../common/parse-cli-args";
import runAll from "../../lib/npm-run-all";

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
export default function npmRunAll(args, stdout, stderr) {
    try {
        const stdin = process.stdin;
        const {
            lastGroup: {
                patterns,
                parallel,
                continueOnError,
                printLabel,
                printName
            },
            silent,
            packageConfig
        } = parseCLIArgs(
            args,
            {parallel: true},
            {singleMode: true}
        );

        if (patterns.length === 0) {
            return Promise.resolve(null);
        }

        return runAll(
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
                silent
            }
        );
    }
    catch (err) {
        return Promise.reject(err);
    }
}
