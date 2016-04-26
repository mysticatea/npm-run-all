#!/usr/bin/env node

/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * The main process of `run-p` command.
 *
 * @param {string[]} args - Arguments to parse.
 * @param {stream.Writable} stdout - A writable stream to print logs.
 * @param {stream.Writable} stderr - A writable stream to print errors.
 * @returns {Promise} A promise which comes to be fulfilled when all npm-scripts are completed.
 * @private
 */
export default function main(
    args,
    stdout = null,
    stderr = null
) {
    switch (args[0]) {
        case undefined:
        case "-h":
        case "--help":
            return require("./help").default(stdout);

        case "-v":
        case "--version":
            return require("../common/version").default(stdout);

        default:
            return require("./main").default(args, stdout, stderr);
    }
}

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------
/* eslint-disable no-process-exit */
/* istanbul ignore if */
if (require.main === module) {
    // Execute.
    const promise = main(process.argv.slice(2), process.stdout, process.stderr);

    // Error Handling.
    promise.then(
        () => {
            // I'm not sure why, but maybe the process never exits on Git Bash (MINGW64)
            process.exit(0);
        },
        (err) => {
            console.error("ERROR:", err.message); // eslint-disable-line no-console
            process.exit(1);
        }
    );
}
