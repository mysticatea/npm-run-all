/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

/**
 * Reads the version of `npm-run-all`.
 *
 * @param {string} path - A path to `package.json`.
 * @returns {string|null} A version text.
 */
function read(path) {
    try {
        return require(path).version;
    }
    catch (err) {
        return null;
    }
}

// In tests, `../../package.json` is correct.
const version = read("../package.json") || read("../../package.json");

/**
 * Print a version text.
 *
 * @param {stream.Writable} output - A writable stream to print.
 * @returns {Promise} Always a fulfilled promise.
 * @private
 */
export default function printVersion(output) {
    output.write(`v${version}\n`);
    return Promise.resolve(null);
}
