/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const Promise = require("pinkie-promise")
const readPkgUp = require("read-pkg-up").sync

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Print a version text.
 *
 * @param {stream.Writable} output - A writable stream to print.
 * @returns {Promise} Always a fulfilled promise.
 * @private
 */
module.exports = function printVersion(output) {
    const version = readPkgUp({cwd: __dirname}).pkg.version

    output.write(`v${version}\n`)

    return Promise.resolve(null)
}
