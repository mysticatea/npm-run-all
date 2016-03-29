"use strict";

var Readable = require("stream").Readable;
var inherits = require("util").inherits;

var ConstantStream = module.exports = function ConstantStream(value) {
    Readable.call(this);
    this.value = value || "";
};
inherits(ConstantStream, Readable);

ConstantStream.prototype._read = function _read() {
    this.push(this.value);
    this.push(null);
};
