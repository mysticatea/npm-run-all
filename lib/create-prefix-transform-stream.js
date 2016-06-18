/**
 * @module create-prefix-transform-stream
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require("stream");

var Transform = _require.Transform;

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

var ALL_BR = /\n/g;

/**
 * The transform stream to insert a specific prefix.
 *
 * Several streams can exist for the same output stream.
 * This stream will insert the prefix if the last output came from other instance.
 * To do that, this stream is using a shared state object.
 *
 * @private
 */

var PrefixTransform = function (_Transform) {
  _inherits(PrefixTransform, _Transform);

  /**
   * @param {string} prefix - A prefix text to be inserted.
   * @param {object} state - A state object.
   * @param {string} state.lastPrefix - The last prefix which is printed.
   * @param {boolean} state.lastIsLinebreak -The flag to check whether the last output is a line break or not.
   */

  function PrefixTransform(prefix, state) {
    _classCallCheck(this, PrefixTransform);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PrefixTransform).call(this));

    _this.prefix = prefix;
    _this.state = state;
    return _this;
  }

  /**
   * Transforms the output chunk.
   *
   * @param {string|Buffer} chunk - A chunk to be transformed.
   * @param {string} encoding - The encoding of the chunk.
   * @param {function} callback - A callback function that is called when done.
   * @returns {void}
   */


  _createClass(PrefixTransform, [{
    key: "_transform",
    value: function _transform(chunk, encoding, callback) {
      var prefix = this.prefix;
      var nPrefix = "\n" + prefix;
      var state = this.state;
      var firstPrefix = state.lastIsLinebreak ? prefix : state.lastPrefix !== prefix ? "\n" :
      /* otherwise */"";
      var prefixed = ("" + firstPrefix + chunk).replace(ALL_BR, nPrefix);
      var index = prefixed.indexOf(prefix, Math.max(0, prefixed.length - prefix.length));

      state.lastPrefix = prefix;
      state.lastIsLinebreak = index !== -1;

      callback(null, index !== -1 ? prefixed.slice(0, index) : prefixed);
    }
  }]);

  return PrefixTransform;
}(Transform);

//------------------------------------------------------------------------------
// Public API
//------------------------------------------------------------------------------

/**
 * Create a transform stream to insert the specific prefix.
 *
 * Several streams can exist for the same output stream.
 * This stream will insert the prefix if the last output came from other instance.
 * To do that, this stream is using a shared state object.
 *
 * @param {string} prefix - A prefix text to be inserted.
 * @param {object} state - A state object.
 * @param {string} state.lastPrefix - The last prefix which is printed.
 * @param {boolean} state.lastIsLinebreak -The flag to check whether the last output is a line break or not.
 * @returns {stream.Transform} The created transform stream.
 */


module.exports = function createPrefixTransform(prefix, state) {
  return new PrefixTransform(prefix, state);
};