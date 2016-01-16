#!/usr/bin/env node

/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

/**
 * The main process of `npm-run-all` command.
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
            return require("./version").default(stdout);

        default:
            return require("./main").default(args, stdout, stderr);
    }
}

/* eslint-disable no-process-exit */
/* istanbul ignore if */
if (require.main === module) {
    // Execute.
    const promise = main(process.argv.slice(2), process.stdout, process.stderr);

    // Error Handling.
    promise.catch(err => {
        console.error("ERROR:", err.message); // eslint-disable-line no-console
        process.exit(1);
    });
}
