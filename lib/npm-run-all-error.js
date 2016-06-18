/**
 * @module npm-run-all-error
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Error object with some additional info.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (_Error) {
  _inherits(NpmRunAllError, _Error);

  /**
   * Constructor.
   *
   * @param {{name: string, code: number}} causeResult -
   *      The result item of the npm-script which causes an error.
   * @param {Array.<{name: string, code: (number|undefined)}>} allResults -
   *      All result items of npm-scripts.
   */

  function NpmRunAllError(causeResult, allResults) {
    _classCallCheck(this, NpmRunAllError);

    /**
     * The name of a npm-script which exited with a non-zero code.
     * @type {string}
     */

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(NpmRunAllError).call(this, "\"" + causeResult.task + "\" exited with " + causeResult.code + "."));

    _this.name = causeResult.name;

    /**
     * The code of a npm-script which exited with a non-zero code.
     * This can be `undefined`.
     * @type {number}
     */
    _this.code = causeResult.code;

    /**
     * All result items of npm-scripts.
     * @type {Array.<{name: string, code: (number|undefined)}>}
     */
    _this.results = allResults;
    return _this;
  }

  return NpmRunAllError;
}(Error);