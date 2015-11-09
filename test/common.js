import {PassThrough} from "stream";
import assert from "power-assert";
import {result, removeResult} from "./lib/util";
import BufferStream from "./lib/buffer-stream";

// Test targets.
import runAll from "../src/lib/npm-run-all";
import command from "../src/bin/npm-run-all";

describe("[common] npm-run-all", () => {
    before(() => { process.chdir("test-workspace"); });
    after(() => { process.chdir(".."); });

    beforeEach(removeResult);

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

    it("should do nothing if a task list is empty.", () =>
        runAll(null).then(() => assert(result() == null))
    );

    describe("should run a task by npm (check an environment variable):", () => {
        it("lib version", () =>
            runAll("test-task:env-check")
                .then(() => assert(result() === "OK"))
        );

        it("command version", () =>
            command(["test-task:env-check"])
                .then(() => assert(result() === "OK"))
        );
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
        it("lib version", () => runAll("restart"));
        it("command version", () => command(["restart"]));
    });

    describe("should be able to use `env` built-in task:", () => {
        it("lib version", () => runAll("env"));
        it("command version", () => command(["env"]));
    });
});
