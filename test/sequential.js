import assert from "power-assert";
import {result, removeResult} from "./lib/util";
import spawnWithKill from "./lib/spawn-with-kill";

// Test targets.
import runAll from "../src/lib/npm-run-all";
import command from "../src/bin/npm-run-all";

describe("[sequencial] npm-run-all", () => {
    before(() => { process.chdir("test-workspace"); });
    after(() => { process.chdir(".."); });

    beforeEach(removeResult);

    describe("should run tasks sequentially / serially:", () => {
        it("lib version", () =>
            runAll(["test-task:append a", "test-task:append b"], {parallel: false})
                .then(() => {
                    assert(result() === "aabb");
                })
        );

        it("command version", () =>
            command(["test-task:append a", "test-task:append b"])
                .then(() => {
                    assert(result() === "aabb");
                })
        );
    });

    describe("should remove intersected tasks from two or more patterns:", () => {
        it("lib version", () =>
            runAll(["test-task:*:a", "*:append:a"], {parallel: false})
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
            runAll(["test-task:*:a", "test-task:*:a"], {parallel: false})
                .then(() => {
                    assert(result() === "aaaa");
                })
        );

        it("command version", () =>
            command(["test-task:*:a", "test-task:*:a"])
                .then(() => {
                    assert(result() === "aaaa");
                })
        );
    });

    it("should kill child processes when it's killed", () =>
        spawnWithKill(
            "node",
            ["../node_modules/babel/bin/babel-node.js", "../src/bin/npm-run-all.js", "test-task:append2 a"]
        )
        .then(() => {
            assert(result() == null || result() === "a");
        })
    );

    describe("should continue on error when --continue-on-error option was specified:", () => {
        it("lib version", () =>
            runAll(["test-task:append a", "test-task:error", "test-task:append b"], {continueOnError: true})
                .then(() => {
                    assert(result() === "aabb");
                })
        );

        it("command version", () =>
            command(["test-task:append a", "test-task:error", "test-task:append b", "--continue-on-error"])
                .then(() => {
                    assert(result() === "aabb");
                })
        );

        it("command version (-S shorthand)", () =>
            command(["-S", "test-task:append a", "test-task:error", "test-task:append b"])
                .then(() => {
                    assert(result() === "aabb");
                })
        );
    });
});
