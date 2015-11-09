/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
import runAll from "../lib/npm-run-all";

const START_PROMISE = Promise.resolve(null);

/**
 * Parses arguments.
 *
 * @param {string[]} args - Arguments to parse.
 * @returns {{parallel: boolean, patterns: string[]}[]} A running plan.
 */
function parse(args) {
    return args.reduce((queue, arg) => {
        switch (arg) {
            case "-s":
            case "--sequential":
                queue.push({parallel: false, patterns: []});
                break;

            case "-p":
            case "--parallel":
                queue.push({parallel: true, patterns: []});
                break;

            default:
                if (arg[0] === "-") {
                    throw new Error(`Invalid Option: ${arg}`);
                }
                queue[queue.length - 1].patterns.push(arg);
                break;
        }
        return queue;
    }, [{parallel: false, patterns: []}]);
}

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
        return parse(args).reduce(
            (prev, group) => (group.patterns.length === 0) ?
                prev :
                prev.then(() => runAll(
                    group.patterns,
                    {
                        stdout,
                        stderr,
                        stdin: process.stdin,
                        parallel: group.parallel
                    }
                )),
            START_PROMISE
        );
    }
    catch (err) {
        return Promise.reject(err);
    }
}
