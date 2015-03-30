import {execSync} from "child_process";
import assert from "power-assert";
import {result, removeResult} from "./lib/util";

// Test targets.
import runAll from "../lib/index";
import "../lib/command";

describe("npm-run-all", () => {
  beforeEach(removeResult);
  after(removeResult);

  describe("should run tasks on parallel when was given --parallel option:", () => {
    it("lib version", () => {
      return runAll(["test-task:append-a", "test-task:append-b"], {parallel: true})
        .then(() => {
          assert(result() === "abab" ||
                 result() === "baba" ||
                 result() === "abba" ||
                 result() === "baab");
        });
    });

    it("command version", () => {
      execSync("node lib/command.js --parallel test-task:append-a test-task:append-b");
      assert(result() === "abab" ||
             result() === "baba" ||
             result() === "abba" ||
             result() === "baab");
    });
  });

});
