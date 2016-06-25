/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Define the function for main process.
 *
 * @param {string} name - A program name.
 * @returns {function} The function for main process.
 */
function defineMain(name) {
    /**
     * The main process of `npm-run-all` command.
     *
     * @param {string[]} args - Arguments to parse.
     * @param {stream.Writable} stdout - A writable stream to print logs.
     * @param {stream.Writable} stderr - A writable stream to print errors.
     * @returns {Promise} A promise which comes to be fulfilled when all
     *      npm-scripts are completed.
     * @private
     */
    return function main(args, stdout = null, stderr = null) {
        switch (args[0]) {
            case undefined:
            case "-h":
            case "--help":
                return require(`../${name}/help`)(stdout)

            case "-v":
            case "--version":
                return require("./version")(stdout)

            default:
                return require(`../${name}/main`)(args, stdout, stderr)
        }
    }
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = function bootstrap(entryModule, name) {
    const main = entryModule.exports = defineMain(name)

    /* eslint-disable no-console, no-process-exit */
    /* istanbul ignore if */
    if (require.main === entryModule) {
        // Execute.
        const promise = main(
            process.argv.slice(2),
            process.stdout,
            process.stderr
        )

        // Error Handling.
        promise.then(
            () => {
                // I'm not sure why, but maybe the process never exits
                // on Git Bash (MINGW64)
                process.exit(0)
            },
            (err) => {
                console.error("ERROR:", err.message)
                process.exit(1)
            }
        )
    }
}

