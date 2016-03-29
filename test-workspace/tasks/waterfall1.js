"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var Transform = require("stream").Transform;

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function ToUpperCaseStream() {
    Transform.call(this);
}

ToUpperCaseStream.prototype = Object.create(Transform.prototype, {
    _transform: {
        value: function _transform(chunk, encoding, callback) {
            callback(null, chunk.toString().toUpperCase());
        },
        configurable: true,
        writable: true
    }
});

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

process.stdin.pipe(new ToUpperCaseStream()).pipe(process.stdout);
