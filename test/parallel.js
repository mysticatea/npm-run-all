import assert from "power-assert";
import {result, removeResult} from "./lib/util";
import spawnWithKill from "./lib/spawn-with-kill";

// Test targets.
import runAll from "../src/lib/npm-run-all";
import command from "../src/bin/npm-run-all";

describe("[parallel] npm-run-all", () => {
    before(() => { process.chdir("test-workspace"); });
    after(() => { process.chdir(".."); });

    beforeEach(removeResult);

    describe("should run tasks on parallel when was given --parallel option:", () => {
        it("lib version", () =>
            runAll(["test-task:append a", "test-task:append b"], {parallel: true})
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                })
        );

        it("command version", () =>
            command(["--parallel", "test-task:append a", "test-task:append b"])
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                })
        );
    });

    describe("should kill all tasks when was given --parallel option if a task exited with non-zero code:", () => {
        it("lib version", () =>
            runAll(["test-task:append2 a", "test-task:error"], {parallel: true})
                .then(
                    () => {
                        assert(false, "should fail");
                    },
                    () => {
                        assert(result() == null || result() === "a");
                    })
        );

        it("command version", () =>
            command(["--parallel", "test-task:append2 a", "test-task:error"])
                .then(
                    () => {
                        assert(false, "should fail");
                    },
                    () => {
                        assert(result() == null || result() === "a");
                    }
                )
        );
    });

    describe("should remove intersected tasks from two or more patterns:", () => {
        it("lib version", () =>
            runAll(["test-task:*:a", "*:append:a"], {parallel: true})
                .then(() => {
                    assert(result() === "aa");
                })
        );

        it("command version", () =>
            command(["test-task:*:a", "*:append:a"])
                .then(() => {
                    assert(result() === "aa");
                })
        );
    });

    describe("should not remove duplicate tasks from two or more the same pattern:", () => {
        it("lib version", () =>
            runAll(["test-task:*:a", "test-task:*:a"], {parallel: true})
                .then(() => {
                    assert(result() === "aaaa");
                })
        );

        it("command version", () =>
            command(["--parallel", "test-task:*:a", "test-task:*:a"])
                .then(() => {
                    assert(result() === "aaaa");
                })
        );
    });

    it("should kill child processes when it's killed", () =>
        spawnWithKill(
            "node",
            ["../node_modules/babel/bin/babel-node.js", "../src/bin/npm-run-all.js", "--parallel", "test-task:append2 a"]
        )
        .then(() => {
            assert(result() == null || result() === "a");
        })
    );

    describe("should continue on error when --continue-on-error option was specified:", () => {
        it("lib version", () =>
            runAll(["test-task:append a", "test-task:error", "test-task:append b"], {parallel: true, continueOnError: true})
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                })
        );

        it("command version", () =>
            command(["--parallel", "test-task:append a", "test-task:error", "test-task:append b", "--continue-on-error"])
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                })
        );

        it("command version (-P shorthand)", () =>
            command(["-P", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(() => {
                    assert(
                        result() === "abab" ||
                        result() === "baba" ||
                        result() === "abba" ||
                        result() === "baab");
                })
        );
    });
});
