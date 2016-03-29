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
 * @param {object} [options] - An option object.
 * @param {stream.Readable} [options.stdin] - A readable stream to input.
 * @param {stream.Writable} [options.stdout] - A writable stream to print logs.
 * @param {stream.Writable} [options.stderr] - A writable stream to print errors.
 * @returns {Promise} A promise which comes to be fulfilled when all npm-scripts are completed.
 * @private
 */
export default function main(
    args,
    {
        stdin = null,
        stdout = null,
        stderr = null
    } = {}
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
            return require("./main").default(args, stdin, stdout, stderr);
    }
}

/* eslint-disable no-process-exit, no-console */
/* istanbul ignore if */
if (require.main === module) {
    // Execute.
    main(
        process.argv.slice(2),
        {
            stdin: process.stdin,
            stdout: process.stdout,
            stderr: process.stderr
        }
    ).then(
        () => {
            // I'm not sure why, but maybe the process never exits on Git Bash (MINGW64)
            process.exit(0);
        },
        (err) => {
            console.error("ERROR:", err.message);
            process.exit(1);
        }
    );
}
