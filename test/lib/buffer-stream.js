"use strict";

var Writable = require("stream").Writable;
var inherits = require("util").inherits;

var BufferStream = module.exports = function BufferStream() {
    Writable.call(this);
    this.value = "";
};
inherits(BufferStream, Writable);

BufferStream.prototype._write = function _write(chunk, encoding, callback) {
    this.value += chunk.toString();
    callback();
};
