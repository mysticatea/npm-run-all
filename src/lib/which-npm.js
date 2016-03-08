/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
import which from "which";

const cache = Object.create(null);

/**
 * Gets a file path of `npm` command.
 *
 * @returns {Promise<string>}
 *   A promise object which becomes fullfilled when it got a file path of `npm` command.
 * @private
 */
export default function whichNpm() {
    const cwd = process.cwd();
    if (cache[cwd] == null) {
        cache[cwd] = new Promise((resolve, reject) => {
            which("npm", (err, npmPath) => {
                if (err != null) {
                    reject(err);
                }
                else {
                    resolve(process.platform === "win32" ? `"${npmPath}"` : npmPath);
                }
            });
        });
    }

    return cache[cwd];
}
