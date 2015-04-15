import {exec} from "shelljs";
import {PassThrough} from "stream";
import assert from "power-assert";
import {result, removeResult} from "./lib/util";

// Test targets.
import runAll from "../lib/index";
import "../lib/command";

describe("npm-run-all", () => {
  beforeEach(removeResult);
  after(removeResult);

  describe("should run a task by npm:", () => {
    it("lib version", () => {
      return runAll("test-task:env-check")
        .then(() => {
          assert(result() === "OK");
        });
    });

    it("command version", () => {
      exec("node lib/command.js test-task:env-check");
      assert(result() === "OK");
    });
  });

  describe("should fail to run when tasks exited with non-zero code:", () => {
    it("lib version", () => {
      return runAll("test-task:error")
        .then(
          () => {
            assert(false, "should fail");
          },
          () => {
            // OK.
            return null;
          });
    });

    it("command version", () => {
      var res = exec("node lib/command.js test-task:error");
      assert.ok(res.code > 0);
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

  it("stdout option should pipe from task.", done => {
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

  it("stderr option should pipe from task.", done => {
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

});
