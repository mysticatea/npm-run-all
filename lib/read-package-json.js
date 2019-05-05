/**
 * @module read-package-json
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const pathResolve = require("path").resolve
const readManifest = require("@pnpm/read-importer-manifest").default

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Reads the package.json in the current directory.
 *
 * @returns {object} package.json's information.
 */
module.exports = function readPackageJson() {
    return readManifest(process.cwd()).then(readResult => ({
        taskList: Object.keys(readResult.manifest.scripts || {}),
        packageInfo: {
            body: readResult.manifest,
            path: pathResolve(readResult.fileName),
        },
    }))
}
