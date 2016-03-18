import assert from "power-assert";
import {result, removeResult} from "./lib/util";

// Test targets.
import command from "../src/bin/npm-run-all";

describe("[mixed] npm-run-all", () => {
    before(() => { process.chdir("test-workspace"); });
    after(() => { process.chdir(".."); });

    beforeEach(removeResult);

    it("should run a mix of sequential / serial and parallel tasks (has the default group):", () =>
        command([
            "test-task:append a",
            "-p", "test-task:append b", "test-task:append c",
            "-s", "test-task:append d", "test-task:append e"
        ])
        .then(() => {
            assert(
                result() === "aabcbcddee" ||
                result() === "aabccbddee" ||
                result() === "aacbbcddee" ||
                result() === "aacbcbddee");
        })
    );

    it("should run a mix of sequential / serial and parallel tasks (doesn't have the default group):", () =>
        command([
            "-p", "test-task:append b", "test-task:append c",
            "-s", "test-task:append d", "test-task:append e"
        ])
        .then(() => {
            assert(
                result() === "bcbcddee" ||
                result() === "bccbddee" ||
                result() === "cbbcddee" ||
                result() === "cbcbddee");
        })
    );
});
