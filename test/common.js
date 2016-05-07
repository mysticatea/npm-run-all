/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("power-assert");
const {result, removeResult} = require("./lib/util");
const BufferStream = require("./lib/buffer-stream");

// Test targets.
const nodeApi = require("../src/lib");
const runAll = require("../src/bin/npm-run-all");
const runSeq = require("../src/bin/run-s");
const runPar = require("../src/bin/run-p");

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("[common]", () => {
    before(() => process.chdir("test-workspace"));
    after(() => process.chdir(".."));

    beforeEach(removeResult);

    describe("should print a help text if arguments are nothing.", () => {
        it("npm-run-all command", () => {
            const buf = new BufferStream();
            return runAll([], buf)
                .then(() => assert(/Usage:/.test(buf.value)));
        });

        it("run-s command", () => {
            const buf = new BufferStream();
            return runSeq([], buf)
                .then(() => assert(/Usage:/.test(buf.value)));
        });

        it("run-p command", () => {
            const buf = new BufferStream();
            return runPar([], buf)
                .then(() => assert(/Usage:/.test(buf.value)));
        });
    });

    describe("should print a help text if the first argument is --help (-h)", () => {
        it("npm-run-all command (-h)", () => {
            const buf = new BufferStream();
            return runAll(["-h"], buf)
                .then(() => assert(/Usage:/.test(buf.value)));
        });

        it("run-s command (-h)", () => {
            const buf = new BufferStream();
            return runSeq(["-h"], buf)
                .then(() => assert(/Usage:/.test(buf.value)));
        });

        it("run-p command (-h)", () => {
            const buf = new BufferStream();
            return runPar(["-h"], buf)
                .then(() => assert(/Usage:/.test(buf.value)));
        });

        it("npm-run-all command (--help)", () => {
            const buf = new BufferStream();
            return runAll(["--help"], buf)
                .then(() => assert(/Usage:/.test(buf.value)));
        });

        it("run-s command (--help)", () => {
            const buf = new BufferStream();
            return runSeq(["--help"], buf)
                .then(() => assert(/Usage:/.test(buf.value)));
        });

        it("run-p command (--help)", () => {
            const buf = new BufferStream();
            return runPar(["--help"], buf)
                .then(() => assert(/Usage:/.test(buf.value)));
        });
    });

    describe("should print a version number if the first argument is --version (-v)", () => {
        it("npm-run-all command (-v)", () => {
            const buf = new BufferStream();
            return runAll(["-v"], buf)
                .then(() => assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(buf.value)));
        });

        it("run-s command (-v)", () => {
            const buf = new BufferStream();
            return runSeq(["-v"], buf)
                .then(() => assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(buf.value)));
        });

        it("run-p command (-v)", () => {
            const buf = new BufferStream();
            return runPar(["-v"], buf)
                .then(() => assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(buf.value)));
        });

        it("npm-run-all command (--version)", () => {
            const buf = new BufferStream();
            return runAll(["--version"], buf)
                .then(() => assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(buf.value)));
        });

        it("run-s command (--version)", () => {
            const buf = new BufferStream();
            return runSeq(["--version"], buf)
                .then(() => assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(buf.value)));
        });

        it("run-p command (--version)", () => {
            const buf = new BufferStream();
            return runPar(["--version"], buf)
                .then(() => assert(/v[0-9]+\.[0-9]+\.[0-9]+/.test(buf.value)));
        });
    });

    describe("should do nothing if a task list is empty.", () => {
        it("Node API", () =>
            nodeApi(null).then(() => assert(result() == null))
        );
    });

    describe("should run a task by npm (check an environment variable):", () => {
        it("Node API", () =>
            nodeApi("test-task:env-check")
                .then(() => assert(result() === "OK"))
        );

        it("npm-run-all command", () =>
            runAll(["test-task:env-check"])
                .then(() => assert(result() === "OK"))
        );

        it("run-s command", () =>
            runSeq(["test-task:env-check"])
                .then(() => assert(result() === "OK"))
        );

        it("run-p command", () =>
            runPar(["test-task:env-check"])
                .then(() => assert(result() === "OK"))
        );
    });

    describe("stdin can be used in tasks:", () => {
        it("Node API", () =>
            nodeApi("test-task:stdin")
                .then(() => assert(result().trim() === "STDIN"))
        );

        it("npm-run-all command", () =>
            runAll(["test-task:stdin"])
                .then(() => assert(result().trim() === "STDIN"))
        );

        it("run-s command", () =>
            runSeq(["test-task:stdin"])
                .then(() => assert(result().trim() === "STDIN"))
        );

        it("run-p command", () =>
            runPar(["test-task:stdin"])
                .then(() => assert(result().trim() === "STDIN"))
        );
    });

    describe("stdout can be used in tasks:", () => {
        it("Node API", () =>
            nodeApi("test-task:stdout")
                .then(() => assert(result() === "STDOUT"))
        );

        it("npm-run-all command", () =>
            runAll(["test-task:stdout"])
                .then(() => assert(result() === "STDOUT"))
        );

        it("run-s command", () =>
            runSeq(["test-task:stdout"])
                .then(() => assert(result() === "STDOUT"))
        );

        it("run-p command", () =>
            runPar(["test-task:stdout"])
                .then(() => assert(result() === "STDOUT"))
        );
    });

    describe("stderr can be used in tasks:", () => {
        it("Node API", () =>
            nodeApi("test-task:stderr")
                .then(() => assert(result() === "STDERR"))
        );

        it("npm-run-all command", () =>
            runAll(["test-task:stderr"])
                .then(() => assert(result() === "STDERR"))
        );

        it("run-s command", () =>
            runSeq(["test-task:stderr"])
                .then(() => assert(result() === "STDERR"))
        );

        it("run-p command", () =>
            runPar(["test-task:stderr"])
                .then(() => assert(result() === "STDERR"))
        );
    });

    describe("should be able to use `restart` built-in task:", () => {
        it("Node API", () => nodeApi("restart"));
        it("npm-run-all command", () => runAll(["restart"]));
        it("run-s command", () => runSeq(["restart"]));
        it("run-p command", () => runPar(["restart"]));
    });

    describe("should be able to use `env` built-in task:", () => {
        it("Node API", () => nodeApi("env"));
        it("npm-run-all command", () => runAll(["env"]));
        it("run-s command", () => runSeq(["env"]));
        it("run-p command", () => runPar(["env"]));
    });

    if (process.platform === "win32") {
        describe("issue14", () => {
            it("Node API", () => nodeApi("test-task:issue14:win32"));
            it("npm-run-all command", () => runAll(["test-task:issue14:win32"]));
            it("run-s command", () => runSeq(["test-task:issue14:win32"]));
            it("run-p command", () => runPar(["test-task:issue14:win32"]));
        });
    }
    else {
        describe("issue14", () => {
            it("Node API", () => nodeApi("test-task:issue14:posix"));
            it("npm-run-all command", () => runAll(["test-task:issue14:posix"]));
            it("run-s command", () => runSeq(["test-task:issue14:posix"]));
            it("run-p command", () => runPar(["test-task:issue14:posix"]));
        });
    }

    describe("should not print log if silent option was given:", () => {
        it("Node API", () => {
            const stdout = new BufferStream();
            const stderr = new BufferStream();
            return nodeApi("test-task:error", {silent: true, stdout, stderr})
                .then(
                    () => assert(false, "Should fail."),
                    () => assert(stdout.value === "" && stderr.value === "")
                );
        });

        it("npm-run-all command", () => {
            const stdout = new BufferStream();
            const stderr = new BufferStream();
            return runAll(["--silent", "test-task:error"], stdout, stderr)
                .then(
                    () => assert(false, "Should fail."),
                    () => assert(stdout.value === "" && stderr.value === "")
                );
        });

        it("run-s command", () => {
            const stdout = new BufferStream();
            const stderr = new BufferStream();
            return runSeq(["--silent", "test-task:error"], stdout, stderr)
                .then(
                    () => assert(false, "Should fail."),
                    () => assert(stdout.value === "" && stderr.value === "")
                );
        });

        it("run-p command", () => {
            const stdout = new BufferStream();
            const stderr = new BufferStream();
            return runPar(["--silent", "test-task:error"], stdout, stderr)
                .then(
                    () => assert(false, "Should fail."),
                    () => assert(stdout.value === "" && stderr.value === "")
                );
        });
    });
});
