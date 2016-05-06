/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

/* eslint-disable no-trailing-spaces */
const assert = require("power-assert");
const createHeader = require("../src/lib/create-header");
const readPackageJson = require("../src/lib/read-package-json");
const BufferStream = require("./lib/buffer-stream");

// Test targets.
const runAll = require("../src/lib");
const command = require("../src/bin/npm-run-all");

describe("[print-name] npm-run-all", () => {
    let packageInfo = null;

    before(() => {
        process.chdir("test-workspace");
        return readPackageJson().then(info => {
            packageInfo = info.packageInfo;
        });
    });
    after(() => process.chdir(".."));

    describe("should print names before running tasks:", () => {
        it("lib version", () => {
            const stdout = new BufferStream();
            return runAll("test-task:echo abc", {stdout, silent: true, printName: true})
                .then(() => {
                    const header = createHeader("test-task:echo abc", packageInfo, false);
                    assert.equal(stdout.value.slice(0, header.length), header);
                });
        });

        it("command version", () => {
            const stdout = new BufferStream();
            return command(["test-task:echo abc", "--silent", "--print-name"], stdout)
                .then(() => {
                    const header = createHeader("test-task:echo abc", packageInfo, false);
                    assert.equal(stdout.value.slice(0, header.length), header);
                });
        });

        it("command version (shorthand)", () => {
            const stdout = new BufferStream();
            return command(["test-task:echo abc", "--silent", "-n"], stdout)
                .then(() => {
                    const header = createHeader("test-task:echo abc", packageInfo, false);
                    assert.equal(stdout.value.slice(0, header.length), header);
                });
        });
    });
});

