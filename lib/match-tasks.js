/**
 * @module match-tasks
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require("minimatch");

var Minimatch = _require.Minimatch;

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

var COLON_OR_SLASH = /[:\/]/g;
var CONVERT_MAP = { ":": "/", "/": ":" };

/**
 * Swaps ":" and "/", in order to use ":" as the separator in minimatch.
 *
 * @param {string} s - A text to swap.
 * @returns {string} The text which was swapped.
 */
function swapColonAndSlash(s) {
    return s.replace(COLON_OR_SLASH, function (matched) {
        return CONVERT_MAP[matched];
    });
}

/**
 * Creates a filter from user-specified pattern text.
 *
 * The task name is the part until the first space.
 * The rest part is the arguments for this task.
 *
 * @param {string} pattern - A pattern to create filter.
 * @returns {{match: function, task: string, args: string}} The filter object of the pattern.
 */
function createFilter(pattern) {
    var trimmed = pattern.trim();
    var spacePos = trimmed.indexOf(" ");
    var task = spacePos < 0 ? trimmed : trimmed.slice(0, spacePos);
    var args = spacePos < 0 ? "" : trimmed.slice(spacePos);
    var matcher = new Minimatch(swapColonAndSlash(task));
    var match = matcher.match.bind(matcher);

    return { match: match, task: task, args: args };
}

/**
 * The set to remove overlapped task.
 */

var TaskSet = function () {
    /**
     * Creates a instance.
     */

    function TaskSet() {
        _classCallCheck(this, TaskSet);

        this.result = [];
        this.sourceMap = Object.create(null);
    }

    /**
     * Adds a command (a pattern) into this set if it's not overlapped.
     * "Overlapped" is meaning that the command was added from a different source.
     *
     * @param {string} command - A pattern text to add.
     * @param {string} source - A task name to check.
     * @returns {void}
     */


    _createClass(TaskSet, [{
        key: "add",
        value: function add(command, source) {
            var sourceList = this.sourceMap[command] || (this.sourceMap[command] = []);
            if (sourceList.length === 0 || sourceList.indexOf(source) !== -1) {
                this.result.push(command);
            }
            sourceList.push(source);
        }
    }]);

    return TaskSet;
}();

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Enumerates tasks which matches with given patterns.
 *
 * @param {string[]} taskList - A list of actual task names.
 * @param {string[]} patterns - Pattern texts to match.
 * @returns {string[]} Tasks which matches with the patterns.
 * @private
 */


module.exports = function matchTasks(taskList, patterns) {
    var filters = patterns.map(createFilter);
    var candidates = taskList.map(swapColonAndSlash);
    var taskSet = new TaskSet();
    var unknownSet = Object.create(null);

    // Take tasks while keep the order of patterns.
    filters.forEach(function (filter) {
        var found = false;

        candidates.forEach(function (candidate) {
            if (filter.match(candidate)) {
                found = true;
                taskSet.add(swapColonAndSlash(candidate) + filter.args, filter.task);
            }
        });

        // Built-in tasks should be allowed.
        if (!found && (filter.task === "restart" || filter.task === "env")) {
            taskSet.add(filter.task + filter.args, filter.task);
            found = true;
        }
        if (!found) {
            unknownSet[filter.task] = true;
        }
    });

    var unknownTasks = Object.keys(unknownSet);
    if (unknownTasks.length > 0) {
        throw new Error("Task not found: \"" + unknownTasks.join("\", ") + "\"");
    }
    return taskSet.result;
};