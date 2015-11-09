import assert from "power-assert";
import {removeResult} from "./lib/util";

// Test targets.
import runAll from "../src/lib/npm-run-all";
import command from "../src/bin/npm-run-all";

/**
 * Throws an assertion error if a given promise comes to be fulfilled.
 *
 * @param {Promise} p - A promise to check.
 * @returns {Promise} A promise which is checked.
 */
function shouldFail(p) {
    return p.then(
        () => assert(false, "should fail"),
        () => null // OK!
    );
}

describe("[fail] npm-run-all should fail", () => {
    before(() => { process.chdir("test-workspace"); });
    after(() => { process.chdir(".."); });

    beforeEach(removeResult);

    it("if an invalid option exists.", () =>
        shouldFail(command(["--invalid"]))
    );

    it("if invalid `options.taskList` is given.", () =>
        shouldFail(runAll("test-task:append a", {taskList: {invalid: 0}}))
    );

    describe("if unknown tasks are given:", () => {
        it("lib version", () => shouldFail(runAll("unknown-task")));
        it("command version", () => shouldFail(command(["unknown-task"])));
    });

    describe("if package.json is not found:", () => {
        before(() => { process.chdir("no-package-json"); });
        after(() => { process.chdir(".."); });

        it("lib version", () => shouldFail(runAll(["test-task:append:a"])));
        it("command version", () => shouldFail(command(["test-task:append:a"])));
    });

    describe("if package.json does not have scripts field:", () => {
        before(() => { process.chdir("no-scripts"); });
        after(() => { process.chdir(".."); });

        it("lib version", () => shouldFail(runAll(["test-task:append:a"])));
        it("command version", () => shouldFail(command(["test-task:append:a"])));
    });

    describe("if tasks exited with non-zero code:", () => {
        it("lib version", () => shouldFail(runAll("test-task:error")));
        it("command version", () => shouldFail(command(["test-task:error"])));
    });
});
