import {execSync} from "child_process";
import assert from "power-assert";
import {result, removeResult} from "./lib/util";

// Test targets.
import runAll from "../lib/index";
import "../lib/command";

describe("npm-run-all", () => {
  beforeEach(removeResult);
  after(removeResult);

  it("should run tasks, mixed sequential and parallel 1:", () => {
    execSync("node lib/command.js \"test-task:append a\" -p \"test-task:append b\" \"test-task:append c\" -s \"test-task:append d\" \"test-task:append e\"");
    assert(result() === "aabcbcddee" ||
           result() === "aabccbddee" ||
           result() === "aacbbcddee" ||
           result() === "aacbcbddee");
  });

  it("should run tasks, mixed sequential and parallel 2:", () => {
    execSync("node lib/command.js -p \"test-task:append b\" \"test-task:append c\" -s \"test-task:append d\" \"test-task:append e\"");
    assert(result() === "bcbcddee" ||
           result() === "bccbddee" ||
           result() === "cbbcddee" ||
           result() === "cbcbddee");
  });

});
