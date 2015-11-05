import assert from "power-assert";
import {result, removeResult} from "./lib/util";

// Test targets.
import runAll from "../src/index";
import command from "../src/command";

describe("npm-run-all", () => {
    beforeEach(removeResult);
    after(removeResult);

    describe("should run tasks on sequential:", () => {
        it("lib version", () => {
            return runAll(["test-task:append a", "test-task:append b"], {parallel: false})
                .then(() => {
                    assert(result() === "aabb");
                });
        });

        it("command version", () => {
            return command(["test-task:append a", "test-task:append b"])
                .then(() => {
                    assert(result() === "aabb");
                });
        });
    });

    describe("should remove intersected tasks from two or more patterns:", () => {
        it("lib version", () => {
            return runAll(["test-task:*:a", "*:append:a"], {parallel: false})
                .then(() => {
                    assert(result() === "aa");
                });
        });

        it("command version", () => {
            return command(["test-task:*:a", "*:append:a"])
                .then(() => {
                    assert(result() === "aa");
                });
        });
    });

    describe("should not remove duplicate tasks from two or more the same pattern:", () => {
        it("lib version", () => {
            return runAll(["test-task:*:a", "test-task:*:a"], {parallel: false})
                .then(() => {
                    assert(result() === "aaaa");
                });
        });

        it("command version", () => {
            return command(["test-task:*:a", "test-task:*:a"])
                .then(() => {
                    assert(result() === "aaaa");
                });
        });
    });
});
