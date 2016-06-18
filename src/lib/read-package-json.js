/**
 * @module read-package-json
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const {join: joinPath} = require("path");
const readPkg = require("read-pkg");

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Reads the package.json.
 * @param {string} packageJsonFolder -
 *   Position of package.json
 * @returns {object} package.json's information.
 */
module.exports = function readPackageJson(packageJsonFolder) {
    const path = joinPath(packageJsonFolder, "package.json");
    return readPkg(path).then(body => ({
        taskList: Object.keys(body.scripts || {}),
        packageInfo: {path, body}
    }));
};
