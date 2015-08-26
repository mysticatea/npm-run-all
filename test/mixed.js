import assert from "power-assert";
import {result, removeResult} from "./lib/util";

// Test targets.
import command from "../src/command";

describe("npm-run-all", () => {
    beforeEach(removeResult);
    after(removeResult);

    it("should run a mix of sequential and parallel tasks (has the default group):", () => {
        return command([
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
        });
    });

    it("should run a mix of sequential and parallel tasks (doesn't have the default group):", () => {
        return command([
            "-p", "test-task:append b", "test-task:append c",
            "-s", "test-task:append d", "test-task:append e"
        ])
        .then(() => {
            assert(
                result() === "bcbcddee" ||
                result() === "bccbddee" ||
                result() === "cbbcddee" ||
                result() === "cbcbddee");
        });
    });
});
