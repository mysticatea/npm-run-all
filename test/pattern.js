import assert from "power-assert";
import {result, removeResult} from "./lib/util";

// Test targets.
import runAll from "../lib/index";
import command from "../lib/command";

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
      return command(["test-task:append:*"])
        .then(() => {
          assert(result() === "aabb");
        });
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
      return command(["test-task:append:**:*"])
        .then(() => {
          assert(result() === "aaacacadadbb");
        });
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
      return command(["test-task:append:b", "test-task:append:*"])
        .then(() => {
          assert(result() === "bbaa");
        });
    });
  });

  describe("\"a\" should not match to \"test-task:append:a\"", () => {
    it("lib version", () => {
      return runAll("a")
        .then(
          () => assert(false, "should not match"),
          err => assert((/not found/i).test(err.message))
        );
    });

    it("command version", () => {
      return command(["a"])
        .then(
          () => assert(false, "should not match"),
          err => assert((/not found/i).test(err.message))
        );
    });
  });

});
