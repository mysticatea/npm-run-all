/**
 * @module create-header
 * @author Toru Nagashima
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var chalk = require("chalk");

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Creates the header text for a given task.
 *
 * @param {string} nameAndArgs - A task name and arguments.
 * @param {object} packageInfo - A package.json's information.
 * @param {object} packageInfo.body - A package.json's JSON object.
 * @param {string} packageInfo.path - A package.json's file path.
 * @param {boolean} isTTY - The flag to color the header.
 * @returns {string} The header of a given task.
 */
module.exports = function createHeader(nameAndArgs, packageInfo, isTTY) {
    if (!packageInfo) {
        return "\n> " + nameAndArgs + "\n\n";
    }

    var index = nameAndArgs.indexOf(" ");
    var name = index === -1 ? nameAndArgs : nameAndArgs.slice(0, index);
    var args = index === -1 ? "" : nameAndArgs.slice(index + 1);

    var _ref = packageInfo || {};

    var _ref$body = _ref.body;
    var packageName = _ref$body.name;
    var packageVersion = _ref$body.version;
    var scriptBody = _ref$body.scripts[name];
    var packagePath = _ref.path;

    var color = isTTY ? chalk.styles.gray : { open: "", close: "" };

    return "\n" + color.open + "> " + packageName + "@" + packageVersion + " " + name + " " + packagePath + color.close + "\n" + color.open + "> " + scriptBody + " " + args + color.close + "\n\n";
};