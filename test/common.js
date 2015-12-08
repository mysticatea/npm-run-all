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

    describe("stdin can be used in tasks:", () => {
        it("lib version", () =>
            runAll("test-task:stdin")
                .then(() => assert(result().trim() === "STDIN"))
        );

        it("command version", () =>
            command(["test-task:stdin"])
                .then(() => assert(result().trim() === "STDIN"))
        );
    });

    describe("stdout can be used in tasks:", () => {
        it("lib version", () =>
            runAll("test-task:stdout")
                .then(() => assert(result() === "STDOUT"))
        );

        it("command version", () =>
            command(["test-task:stdout"])
                .then(() => assert(result() === "STDOUT"))
        );
    });

    describe("stderr can be used in tasks:", () => {
        it("lib version", () =>
            runAll("test-task:stderr")
                .then(() => assert(result() === "STDERR"))
        );

        it("command version", () =>
            command(["test-task:stderr"])
                .then(() => assert(result() === "STDERR"))
        );
    });

    describe("should be able to use `restart` built-in task:", () => {
        it("lib version", () => runAll("restart"));
        it("command version", () => command(["restart"]));
    });

    describe("should be able to use `env` built-in task:", () => {
        it("lib version", () => runAll("env"));
        it("command version", () => command(["env"]));
    });

    if (process.platform === "win32") {
        describe("issue14", () => {
            it("lib version", () => runAll("test-task:issue14:win32"));
            it("command version", () => command(["test-task:issue14:win32"]));
        });
    }
    else {
        describe("issue14", () => {
            it("lib version", () => runAll("test-task:issue14:posix"));
            it("command version", () => command(["test-task:issue14:posix"]));
        });
    }
});
