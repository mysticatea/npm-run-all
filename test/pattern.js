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

describe("[pattern] npm-run-all should run matched tasks if gived glob like patterns.", () => {
    before(() => process.chdir("test-workspace"));
    after(() => process.chdir(".."));

    beforeEach(removeResult);

    describe("\"test-task:append:*\" to \"test-task:append:a\" and \"test-task:append:b\"", () => {
        it("lib version", () =>
            runAll("test-task:append:*")
                .then(() => {
                    assert(result() === "aabb");
                })
        );

        it("command version", () =>
            command(["test-task:append:*"])
                .then(() => {
                    assert(result() === "aabb");
                })
        );
    });

    describe("\"test-task:append:**:*\" to \"test-task:append:a\", \"test-task:append:a:c\", \"test-task:append:a:d\", and \"test-task:append:b\"", () => {
        it("lib version", () =>
            runAll("test-task:append:**:*")
                .then(() => {
                    assert(result() === "aaacacadadbb");
                })
        );

        it("command version", () =>
            command(["test-task:append:**:*"])
                .then(() => {
                    assert(result() === "aaacacadadbb");
                })
        );
    });

    describe("(should ignore duplications) \"test-task:append:b\" \"test-task:append:*\" to \"test-task:append:b\", \"test-task:append:a\"", () => {
        it("lib version", () =>
            runAll(["test-task:append:b", "test-task:append:*"])
                .then(() => {
                    assert(result() === "bbaa");
                })
        );

        it("command version", () =>
            command(["test-task:append:b", "test-task:append:*"])
                .then(() => {
                    assert(result() === "bbaa");
                })
        );
    });

    describe("\"a\" should not match to \"test-task:append:a\"", () => {
        it("lib version", () =>
            runAll("a")
                .then(
                    () => assert(false, "should not match"),
                    (err) => assert((/not found/i).test(err.message))
                )
        );

        it("command version", () =>
            command(["a"])
                .then(
                    () => assert(false, "should not match"),
                    (err) => assert((/not found/i).test(err.message))
                )
        );
    });
});
