/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("power-assert")
const readPackageJson = require("../lib/read-package-json")

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[json5]", () => {
    before(() => process.chdir("test-workspace/json5"))
    after(() => process.chdir("../.."))

    it("should read package.json5 when available", () =>
        readPackageJson()
            .then(result => assert(result.packageInfo.path.endsWith("/package.json5")))
    )

    it("should parse package.json5", () =>
        readPackageJson()
            .then(result => assert(result.packageInfo.body.name === "npm-run-all-json5-test"))
    )
})
