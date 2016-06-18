/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const {Writable} = require("stream");

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * The stream to accumulate written data as a single string.
 */
module.exports = class BufferStream extends Writable {
    /**
     * Initialize the current data as a empty string.
     */
    constructor() {
        super();

        /**
         * Accumulated data.
         * @type {string}
         */
        this.value = "";
    }

    /**
     * Accumulates written data.
     *
     * @param {string|Buffer} chunk - A written data.
     * @param {string} encoding - The encoding of chunk.
     * @param {function} callback - The callback to notify done.
     * @returns {void}
     */
    _write(chunk, encoding, callback) {
        this.value += chunk.toString();
        callback();
    }
};
