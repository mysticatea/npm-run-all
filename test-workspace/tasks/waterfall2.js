"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var Transform = require("stream").Transform;

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

function AppendStream() {
    Transform.call(this);
}

AppendStream.prototype = Object.create(Transform.prototype, {
    _transform: {
        value: function _transform(chunk, encoding, callback) {
            this.push(chunk.toString() + "end");
            callback();
        },
        configurable: true,
        writable: true
    }
});

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

process.stdin.pipe(new AppendStream()).pipe(process.stdout);
