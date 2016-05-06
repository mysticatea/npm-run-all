/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

const assert = require("power-assert");
const {result, removeResult} = require("./lib/util");

// Test targets.
const runAll = require("../src/lib");
const command = require("../src/bin/npm-run-all");

describe("[overwriting] npm-run-all should have an ability to overwrite package's config:", () => {
    before(() => process.chdir("test-workspace"));
    after(() => process.chdir(".."));

    beforeEach(removeResult);

    it("lib version should address \"packageConfig\" option", () =>
        runAll("test-task:env-check", {packageConfig: {"npm-run-all-test": {test: "OVERWRITTEN"}}})
            .then(() => {
                assert(result() === "OVERWRITTEN");
            })
    );

    it("lib version should address \"packageConfig\" option for multiple variables", () =>
        runAll("test-task:env-check2", {packageConfig: {"npm-run-all-test": {test: "1", test2: "2", test3: "3"}}})
            .then(() => {
                assert(result() === "1\n2\n3");
            })
    );

    it("command version should address \"--a:b=c\" style options", () =>
        command(["test-task:env-check", "--npm-run-all-test:test=OVERWRITTEN"])
            .then(() => {
                assert(result() === "OVERWRITTEN");
            })
    );

    it("command version should address \"--a:b=c\" style options for multiple variables", () =>
        command(["test-task:env-check2", "--npm-run-all-test:test=1", "--npm-run-all-test:test2=2", "--npm-run-all-test:test3=3"])
            .then(() => {
                assert(result() === "1\n2\n3");
            })
    );

    it("command version should address \"--a:b c\" style options", () =>
        command(["test-task:env-check", "--npm-run-all-test:test", "OVERWRITTEN"])
            .then(() => {
                assert(result() === "OVERWRITTEN");
            })
    );

    it("it should transfar nested command.", () =>
        command(["test-task:nested-env-check", "--npm-run-all-test:test", "OVERWRITTEN"])
            .then(() => {
                assert(result() === "OVERWRITTEN");
            })
    );
});
