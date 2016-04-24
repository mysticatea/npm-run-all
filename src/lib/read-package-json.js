/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import {join as joinPath} from "path";
import readPkg from "read-pkg";

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Reads the package.json in the current directory.
 *
 * @returns {object} package.json's information.
 */
export default function readPackageJson() {
    const path = joinPath(process.cwd(), "package.json");
    return readPkg(path).then(body => ({
        taskList: Object.keys(body.scripts || {}),
        packageInfo: {path, body}
    }));
}
