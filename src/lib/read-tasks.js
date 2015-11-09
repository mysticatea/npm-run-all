/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
import {join} from "path";

/**
 * Reads `package.json` in current directry, and gets all npm-scripts names.
 * If `package.json` has not found, throws an error.
 *
 * @returns {string[]} npm-scripts names.
 * @private
 */
export default function readTasks() {
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = require(packageJsonPath);
    const scripts = packageJson && packageJson.scripts;
    if (typeof scripts === "object" && !Array.isArray(scripts)) {
        return Object.keys(scripts);
    }
    return [];
}
