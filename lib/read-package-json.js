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

const fs = require("fs")
const joinPath = require("path").join
const parseJson5 = require("json5").parse
const parseJson = require("load-json-file")
const normalizePackageData = require("normalize-package-data")

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Reads the package.json in the current directory.
 *
 * @returns {Promise<object>} package.json's information.
 */
module.exports = function readPackageJson() {
    try {
        let path = joinPath(process.cwd(), "package.json5")
        let bodyPromise = null

        if (fs.existsSync(path)) {
            // Read package.json5
            const rawPkg = fs.readFileSync(path, "utf8")
            bodyPromise = Promise.resolve(parseJson5(rawPkg))
        }
        else {
            // Read package.json
            path = joinPath(process.cwd(), "package.json")
            bodyPromise = parseJson(path)
        }

        return bodyPromise.then(body => {
            normalizePackageData(body)
            return {
                taskList: Object.keys(body.scripts || {}),
                packageInfo: { path, body },
            }
        })
    }
    catch (err) {
        return Promise.reject(err)
    }
}
