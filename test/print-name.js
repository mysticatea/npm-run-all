/* eslint-disable no-trailing-spaces */
import assert from "power-assert";
import createHeader from "../src/lib/create-header";
import readPackageJson from "../src/lib/read-package-json";
import BufferStream from "./lib/buffer-stream";

// Test targets.
import runAll from "../src/lib/npm-run-all";
import command from "../src/bin/npm-run-all";

describe("[print-name] npm-run-all", () => {
    let packageInfo = null;

    before(() => {
        process.chdir("test-workspace");
        return readPackageJson().then(info => {
            packageInfo = info.packageInfo;
        });
    });
    after(() => { process.chdir(".."); });

    describe("should print names before running tasks:", () => {
        it("lib version", () => {
            const stdout = new BufferStream();
            return runAll("test-task:echo abc", {stdout, silent: true, printName: true})
                .then(() => {
                    const header = createHeader("test-task:echo abc", packageInfo, false);
                    assert.equal(stdout.value.slice(0, header.length), header);
                });
        });

        it("command version", () => {
            const stdout = new BufferStream();
            return command(["test-task:echo abc", "--silent", "--print-name"], stdout)
                .then(() => {
                    const header = createHeader("test-task:echo abc", packageInfo, false);
                    assert.equal(stdout.value.slice(0, header.length), header);
                });
        });

        it("command version (shorthand)", () => {
            const stdout = new BufferStream();
            return command(["test-task:echo abc", "--silent", "-n"], stdout)
                .then(() => {
                    const header = createHeader("test-task:echo abc", packageInfo, false);
                    assert.equal(stdout.value.slice(0, header.length), header);
                });
        });
    });
});

