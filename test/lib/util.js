var fs = require("fs");
var Writable = require("stream").Writable;
var inherits = require("util").inherits;

var FILE_NAME = "test.txt";

exports.result = function result() {
  try {
    return fs.readFileSync(FILE_NAME, {encoding: "utf8"});
  }
  catch (err) {
    console.error(err.message);
    return null;
  }
};

exports.appendResult = function appendResult(content) {
  fs.appendFileSync(FILE_NAME, content);
};

exports.removeResult = function removeResult() {
  try {
    fs.unlinkSync(FILE_NAME);
  }
  catch (err) {} //eslint-disable-line no-empty
};


var BufferStream = exports.BufferStream = function BufferStream() {
  Writable.call(this);
  this.value = "";
};
inherits(BufferStream, Writable);

BufferStream.prototype._write = function(chunk, encoding, callback) { //eslint-disable-line no-underscore-dangle
  this.value += chunk.toString();
  callback();
};
