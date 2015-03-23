import {execSync} from "child_process";
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
      return runAll("test-task:env-check", {parallel: false})
        .then(() => {
          assert(result() === "OK");
        });
    });

    it("command version", () => {
      execSync("node lib/command.js test-task:env-check");
      assert(result() === "OK");
    });
  });

  describe("should fail to run when tasks exited with non-zero code:", () => {
    it("lib version", () => {
      return runAll("test-task:error", {parallel: false})
        .then(
          () => {
            assert(false, "should fail");
          },
          () => {
            // OK.
            return Promise.resolve(null);
          });
    });

    it("command version", () => {
      assert.throws(() => execSync("node lib/command.js test-task:error"));
    });
  });

  describe("should run tasks on sequential:", () => {
    it("lib version", () => {
      return runAll(["test-task:append-a", "test-task:append-b"], {parallel: false})
        .then(() => {
          assert(result() === "aabb");
        });
    });

    it("command version", () => {
      execSync("node lib/command.js test-task:append-a test-task:append-b");
      assert(result() === "aabb");
    });
  });

});
