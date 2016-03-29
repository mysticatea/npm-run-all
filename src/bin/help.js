/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

/**
 * Print a help text.
 *
 * @param {stream.Writable} output - A writable stream to print.
 * @returns {Promise} Always a fulfilled promise.
 * @private
 */
export default function printHelp(output) {
    output.write(`
Usage: npm-run-all [OPTIONS] [...tasks]

  Run specified tasks.

  Options:
    -h, --help                  Print this text.
    -p, --parallel [...tasks]   Run a group of tasks in parallel.
                                e.g. 'npm-run-all --parallel foo bar'
                                This is similar to 'npm run foo & npm run bar'
    -s, --sequential [...tasks] Run a group of tasks in sequencial.
        --serial [...tasks]     '--serial' is a synonym of '--sequential'.
                                e.g. 'npm-run-all --sequential foo bar'
                                This is similar to 'npm run foo && npm run bar'
    --silent                    Set "silent" to the log level of npm.
    -v, --version               Print version number.
    -w, --waterfall             Run a group of tasks with piping.
                                e.g. 'npm-run-all --waterfall foo bar'
                                This is similar to 'npm run foo | npm run bar'

  See Also:
    https://github.com/mysticatea/npm-run-all#readme
`);

    return Promise.resolve(null);
}
