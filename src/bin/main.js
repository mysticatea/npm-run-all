/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
import runAll from "../lib/npm-run-all";

const START_PROMISE = Promise.resolve(null);
const OVERWRITE_OPTION = /^--([^:]+?):([^=]+?)(?:=(.+))?$/;

/**
 * Overwrites a specified package config.
 *
 * @param {object} config - A config object to be overwritten.
 * @param {string} packageName - A package name to overwrite.
 * @param {string} variable - A variable name to overwrite.
 * @param {string} value - A new value to overwrite.
 * @returns {void}
 */
function overwriteConfig(config, packageName, variable, value) {
    const scope = config[packageName] || (config[packageName] = {}); // eslint-disable-line no-param-reassign
    scope[variable] = value;
}

/**
 * Parses arguments.
 *
 * @param {string[]} args - Arguments to parse.
 * @returns {{parallel: boolean, patterns: string[], packageConfig: object}[]} A running plan.
 */
function parse(args) {
    const packageConfig = {};
    const queue = [{parallel: false, patterns: [], packageConfig}];

    for (let i = 0; i < args.length; ++i) {
        const arg = args[i];

        switch (arg) {
            case "-s":
            case "--sequential":
                if (queue[queue.length - 1].parallel) {
                    queue.push({parallel: false, patterns: [], packageConfig});
                }
                break;

            case "-p":
            case "--parallel":
                queue.push({parallel: true, patterns: [], packageConfig});
                break;

            default: {
                const matched = OVERWRITE_OPTION.exec(arg);
                if (matched) {
                    overwriteConfig(
                        packageConfig,
                        matched[1],
                        matched[2],
                        matched[3] || args[++i]
                    );
                }
                else if (arg[0] === "-") {
                    throw new Error(`Invalid Option: ${arg}`);
                }
                else {
                    queue[queue.length - 1].patterns.push(arg);
                }
                break;
            }
        }
    }

    return queue;
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
                        parallel: group.parallel,
                        packageConfig: group.packageConfig
                    }
                )),
            START_PROMISE
        );
    }
    catch (err) {
        return Promise.reject(err);
    }
}
