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
Usage: npm-run-all [...tasks] [OPTIONS]

  Run specified tasks.

  Options:
    -h, --help                  Print this text.
    -v, --version               Print version number.

    -c, --continue-on-error     Set the flag to ignore errors to the current
                                group of tasks.
    -l, --print-label           Set the flag to print the task name as a prefix
                                on each line of output, to the current group of
                                tasks.
    -n, --print-name            Set the flag to print the task name before
                                running each task, to the current group of
                                tasks.
    --silent                    Set "silent" to the log level of npm.

    -p, --parallel [...tasks]   Run a group of tasks in parallel.
                                e.g. 'npm-run-all -p foo bar' is similar to
                                     'npm run foo & npm run bar'.
    -P [...tasks]               Run a group of tasks in parallel as ignoring
                                errors. This is shorthand of '-p -c [...tasks]'.

    -s, --sequential [...tasks] Run a group of tasks in sequential.
        --serial [...tasks]     '--serial' is a synonym of '--sequential'.
                                e.g. 'npm-run-all -s foo bar' is similar to
                                     'npm run foo && npm run bar'.
    -S [...tasks]               Run a group of tasks in sequential as ignoring
                                errors. This is shorthand of '-s -c [...tasks]'.

  See Also:
    https://github.com/mysticatea/npm-run-all#readme
`);

    return Promise.resolve(null);
}
