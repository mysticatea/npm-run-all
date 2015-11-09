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
    -s, --sequential [...tasks] Run a group of tasks in sequencial.
    -v, --version               Print version number.

  See Also:
    https://github.com/mysticatea/npm-run-all#readme
`);

    return Promise.resolve(null);
}
