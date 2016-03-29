import assert from "power-assert";
import ConstantStream from "./lib/constant-stream";
import BufferStream from "./lib/buffer-stream";

// Test targets.
import runAll from "../src/lib/npm-run-all";
import command from "../src/bin/npm-run-all";

describe("[waterfall] npm-run-all", () => {
    before(() => { process.chdir("test-workspace"); });
    after(() => { process.chdir(".."); });

    describe("should run tasks with piping when was given --waterfall option:", () => {
        it("lib version", () => {
            const stdin = new ConstantStream("hello");
            const stdout = new BufferStream();
            return runAll(["test-task:waterfall:*"], {type: "waterfall", stdin, stdout})
                .then(() => {
                    assert(stdout.value === "HELLOend");
                });
        });

        it("command version", () => {
            const stdin = new ConstantStream("hello");
            const stdout = new BufferStream();
            return command(["--waterfall", "test-task:waterfall:*"], {stdin, stdout})
                .then(() => {
                    assert(stdout.value === "HELLOend");
                });
        });
    });
});
