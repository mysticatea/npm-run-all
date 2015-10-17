import {PassThrough} from "stream";
import assert from "power-assert";
import {result, removeResult, BufferStream} from "./lib/util";

// Test targets.
import runAll from "../src/index";
import command from "../src/command";

describe("npm-run-all", () => {
    beforeEach(removeResult);
    after(removeResult);

    it("should print a help text if arguments are nothing.", () => {
        const buf = new BufferStream();
        return command([], buf)
            .then(() => assert(/Usage:/.test(buf.value)));
    });

    it("should print a help text if the first argument is -h", () => {
        const buf = new BufferStream();
        return command(["-h"], buf)
            .then(() => assert(/Usage:/.test(buf.value)));
    });

    it("should print a version number if the first argument is -v", () => {
        const buf = new BufferStream();
        return command(["-v"], buf)
            .then(() => assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(buf.value)));
    });

    it("should fail if an invalid option exists.", () => {
        return command(["--invalid"])
            .then(
                () => assert(false, "should fail"),
                () => null // OK!
            );
    });

    describe("should run a task by npm (check an environment variable):", () => {
        it("lib version", () => {
            return runAll("test-task:env-check")
                .then(() => assert(result() === "OK"));
        });

        it("command version", () => {
            return command(["test-task:env-check"])
                .then(() => assert(result() === "OK"));
        });
    });

    describe("should fail to run when tasks exited with non-zero code:", () => {
        it("lib version", () => {
            return runAll("test-task:error")
                .then(
                    () => assert(false, "should fail"),
                    () => null // OK!
                );
        });

        it("command version", () => {
            return command(["test-task:error"])
                .then(
                    () => assert(false, "should fail"),
                    () => null // OK!
                );
        });
    });

    it("stdin option should pipe to task.", () => {
        const stream = new PassThrough();
        const promise = runAll("test-task:stdio -- --wait-input", {stdin: stream})
            .then(() => {
                assert(result() === "STDIN");
            });

        stream.write("STDIN");

        return promise;
    });

    it("stdout option should pipe from task.", (done) => {
        const stream = new PassThrough();
        stream.setEncoding("utf8");
        runAll("test-task:stdio", {stdout: stream})
            .then(() => {
                stream.on("readable", () => {
                    assert(stream.read().indexOf("STDOUT") >= 0);
                    done();
                });
            });
    });

    it("stderr option should pipe from task.", (done) => {
        const stream = new PassThrough();
        stream.setEncoding("utf8");
        runAll("test-task:stdio", {stderr: stream})
            .then(() => {
                stream.on("readable", () => {
                    assert(stream.read() === "STDERR");
                    done();
                });
            });
    });

    describe("should be able to use `restart` built-in task:", () => {
        it("lib version", () => {
            return runAll("restart");
        });

        it("command version", () => {
            return command(["restart"]);
        });
    });

    describe("should be able to use `env` built-in task:", () => {
        it("lib version", () => {
            return runAll("env");
        });

        it("command version", () => {
            return command(["env"]);
        });
    });
});
