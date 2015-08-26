var fs = require("fs");
var Writable = require("stream").Writable;
var inherits = require("util").inherits;

var FILE_NAME = "test.txt";

exports.result = function result() {
    try {
        return fs.readFileSync(FILE_NAME, {encoding: "utf8"});
    }
    catch (err) {
        if (err.message.indexOf("ENOENT") < 0) {
            console.error("ERROR:", err.stack);
        }
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
    catch (err) {
        if (err.message.indexOf("ENOENT") < 0) {
            console.error("ERROR:", err.stack);
        }
    }
};


var BufferStream = exports.BufferStream = function BufferStream() {
    Writable.call(this);
    this.value = "";
};
inherits(BufferStream, Writable);

BufferStream.prototype._write = function _write(chunk, encoding, callback) {
    this.value += chunk.toString();
    callback();
};
