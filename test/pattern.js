import {execSync} from "child_process";
import assert from "power-assert";
import {result, removeResult} from "./lib/util";

// Test targets.
import runAll from "../lib/index";
import "../lib/command";

describe("npm-run-all should run matched tasks if gived glob like patterns.", () => {
  beforeEach(removeResult);
  after(removeResult);

  describe("\"test-task:append:*\" to \"test-task:append:a\" and \"test-task:append:b\"", () => {
    it("lib version", () => {
      return runAll("test-task:append:*")
        .then(() => {
          assert(result() === "aabb");
        });
    });

    it("command version", () => {
      execSync("node lib/command.js \"test-task:append:*\"");
      assert(result() === "aabb");
    });
  });

  describe("\"test-task:append:**:*\" to \"test-task:append:a\", \"test-task:append:a:c\", \"test-task:append:a:d\", and \"test-task:append:b\"", () => {
    it("lib version", () => {
      return runAll("test-task:append:**:*")
        .then(() => {
          assert(result() === "aaacacadadbb");
        });
    });

    it("command version", () => {
      execSync("node lib/command.js \"test-task:append:**:*\"");
      assert(result() === "aaacacadadbb");
    });
  });

  describe("(should ignore duplications) \"test-task:append:b\" \"test-task:append:*\" to \"test-task:append:b\", \"test-task:append:a\"", () => {
    it("lib version", () => {
      return runAll(["test-task:append:b", "test-task:append:*"])
        .then(() => {
          assert(result() === "bbaa");
        });
    });

    it("command version", () => {
      execSync("node lib/command.js \"test-task:append:b\" \"test-task:append:*\"");
      assert(result() === "bbaa");
    });
  });

});
