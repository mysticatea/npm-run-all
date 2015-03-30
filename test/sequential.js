import {execSync} from "child_process";
import assert from "power-assert";
import {result, removeResult} from "./lib/util";

// Test targets.
import runAll from "../lib/index";
import "../lib/command";

describe("npm-run-all", () => {
  beforeEach(removeResult);
  after(removeResult);

  describe("should run tasks on sequential:", () => {
    it("lib version", () => {
      return runAll(["test-task:append a", "test-task:append b"], {parallel: false})
        .then(() => {
          assert(result() === "aabb");
        });
    });

    it("command version", () => {
      execSync("node lib/command.js \"test-task:append a\" \"test-task:append b\"");
      assert(result() === "aabb");
    });
  });

});
