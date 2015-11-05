import assert from "power-assert";
import {result, removeResult} from "./lib/util";

// Test targets.
import runAll from "../src/index";
import command from "../src/command";

describe("npm-run-all", () => {
    beforeEach(removeResult);
    after(removeResult);

    describe("should run tasks on parallel when was given --parallel option:", () => {
        it("lib version", () => {
            return runAll(["test-task:append a", "test-task:append b"], {parallel: true})
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                });
        });

        it("command version", () => {
            return command(["--parallel", "test-task:append a", "test-task:append b"])
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                });
        });
    });

    describe("should kill all tasks when was given --parallel option if a task exited with non-zero code:", () => {
        it("lib version", () => {
            return runAll(["test-task:append2 a", "test-task:error"], {parallel: true})
                .then(
                    () => {
                        assert(false, "should fail");
                    },
                    () => {
                        assert(result() == null || result() === "a");
                    });
        });

        it("command version", () => {
            return command(["--parallel", "test-task:append2 a", "test-task:error"])
                .then(
                    () => {
                        assert(false, "should fail");
                    },
                    () => {
                        assert(result() == null || result() === "a");
                    });
        });
    });

    describe("should remove intersected tasks from two or more patterns:", () => {
        it("lib version", () => {
            return runAll(["test-task:*:a", "*:append:a"], {parallel: true})
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
            return runAll(["test-task:*:a", "test-task:*:a"], {parallel: true})
                .then(() => {
                    assert(result() === "aaaa");
                });
        });

        it("command version", () => {
            return command(["--parallel", "test-task:*:a", "test-task:*:a"])
                .then(() => {
                    assert(result() === "aaaa");
                });
        });
    });
});
