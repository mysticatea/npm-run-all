/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
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
        const {groups, silent, packageConfig} = parseCLIArgs(args);

        return groups.reduce(
            (
                prev,
                {
                    patterns,
                    parallel,
                    continueOnError,
                    printLabel,
                    printName
                }
            ) => {
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
                        silent
                    }
                ));
            },
            Promise.resolve(null)
        );
    }
    catch (err) {
        return Promise.reject(err);
    }
}
