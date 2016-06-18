/**
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

/*eslint no-process-env: "off"*/

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var assign = require("object-assign");

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

var OVERWRITE_OPTION = /^--([^:]+?):([^=]+?)(?:=(.+))?$/;
var CONFIG_PATTERN = /^npm_package_config_(.+)$/;
var CONCAT_OPTIONS = /^-[clnps]+$/;

/**
 * Overwrites a specified package config.
 *
 * @param {object} config - A config object to be overwritten.
 * @param {string} packageName - A package name to overwrite.
 * @param {string} variable - A variable name to overwrite.
 * @param {string} value - A new value to overwrite.
 * @returns {void}
 */
function overwriteConfig(config, packageName, variable, value) {
    var scope = config[packageName] || (config[packageName] = {}); // eslint-disable-line no-param-reassign
    scope[variable] = value;
}

/**
 * Creates a package config object.
 * This checks `process.env` and creates the default value.
 *
 * @returns {object} Created config object.
 */
function createPackageConfig() {
    var retv = {};
    var packageName = process.env.npm_package_name;
    if (!packageName) {
        return retv;
    }

    Object.keys(process.env).forEach(function (key) {
        var m = CONFIG_PATTERN.exec(key);
        if (m != null) {
            overwriteConfig(retv, packageName, m[1], process.env[key]);
        }
    });

    return retv;
}

/**
 * Adds a new group into a given list.
 *
 * @param {object[]} groups - A group list to add.
 * @param {object} initialValues - A key-value map for the default of new value.
 * @returns {void}
 */
function addGroup(groups, initialValues) {
    groups.push(assign({ parallel: false, patterns: [] }, initialValues || {}));
}

/**
 * ArgumentSet is values of parsed CLI arguments.
 * This class provides the getter to get the last group.
 */

var ArgumentSet = function () {
    /**
     * @param {object} initialValues - A key-value map for the default of new value.
     * @param {object} options - A key-value map for the options.
     */

    function ArgumentSet() {
        var initialValues = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, ArgumentSet);

        this.continueOnError = false;
        this.groups = [];
        this.printLabel = false;
        this.printName = false;
        this.rest = [];
        this.silent = process.env.npm_config_loglevel === "silent";
        this.singleMode = Boolean(options.singleMode);
        this.packageConfig = createPackageConfig();

        addGroup(this.groups, initialValues);
    }

    /**
     * Gets the last group.
     */


    _createClass(ArgumentSet, [{
        key: "lastGroup",
        get: function get() {
            return this.groups[this.groups.length - 1];
        }
    }]);

    return ArgumentSet;
}();

/**
 * Parses CLI arguments.
 *
 * @param {ArgumentSet} set - The parsed CLI arguments.
 * @param {string[]} args - CLI arguments.
 * @returns {ArgumentSet} set itself.
 */


function parseCLIArgsCore(set, args) {
    // eslint-disable-line complexity
    LOOP: for (var i = 0; i < args.length; ++i) {
        var arg = args[i];

        switch (arg) {
            case "--":
                set.rest = args.slice(1 + i);
                break LOOP;

            case "-c":
            case "--continue-on-error":
                set.continueOnError = true;
                break;

            case "-l":
            case "--print-label":
                set.printLabel = true;
                break;

            case "-n":
            case "--print-name":
                set.printName = true;
                break;

            case "--silent":
                set.silent = true;
                break;

            case "--color":
            case "--no-color":
                // do nothing.
                break;

            case "-s":
            case "--sequential":
            case "--serial":
                if (set.singleMode && arg === "-s") {
                    set.silent = true;
                    break;
                }
                if (set.singleMode) {
                    throw new Error("Invalid Option: " + arg);
                }
                addGroup(set.groups);
                break;

            case "-p":
            case "--parallel":
                if (set.singleMode) {
                    throw new Error("Invalid Option: " + arg);
                }
                addGroup(set.groups, { parallel: true });
                break;

            default:
                {
                    var matched = OVERWRITE_OPTION.exec(arg);
                    if (matched) {
                        overwriteConfig(set.packageConfig, matched[1], matched[2], matched[3] || args[++i]);
                    } else if (CONCAT_OPTIONS.test(arg)) {
                        parseCLIArgsCore(set, arg.slice(1).split("").map(function (c) {
                            return "-" + c;
                        }));
                    } else if (arg[0] === "-") {
                        throw new Error("Invalid Option: " + arg);
                    } else {
                        set.lastGroup.patterns.push(arg);
                    }

                    break;
                }
        }
    }

    return set;
}

/**
 * Parses CLI arguments.
 *
 * @param {string[]} args - CLI arguments.
 * @param {object} initialValues - A key-value map for the default of new value.
 * @param {object} options - A key-value map for the options.
 * @param {boolean} options.singleMode - The flag to be single group mode.
 * @returns {ArgumentSet} The parsed CLI arguments.
 */
module.exports = function parseCLIArgs(args, initialValues, options) {
    return parseCLIArgsCore(new ArgumentSet(initialValues, options), args);
};