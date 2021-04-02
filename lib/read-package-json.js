/**
 * @module read-package-json
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const joinPath = require("path").join

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Reads the package.json in the current directory.
 *
 * @returns {object} package.json's information.
 */
async function readPackageJson() {
    const path = joinPath(process.cwd(), "package.json")
    // https://github.com/mysticatea/eslint-plugin-node/issues/250
    // eslint-disable-next-line @mysticatea/node/no-unsupported-features/es-syntax
    return (await import("read-pkg")).readPackageAsync(path).then(body => ({
        taskList: Object.keys(body.scripts || {}),
        packageInfo: { path, body },
    }))
}

module.exports = readPackageJson
