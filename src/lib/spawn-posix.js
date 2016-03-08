/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
/* eslint no-param-reassign: 0 */
import crossSpawn from "cross-spawn-async";
import getDescendentProcessInfo from "ps-tree";

/**
 * Kills the new process and its sub processes.
 * @this ChildProcess
 */
function kill() {
    getDescendentProcessInfo(this.pid, (err, descendent) => {
        if (err) {
            return;
        }

        for (const {PID: pid} of descendent) {
            try {
                process.kill(pid);
            }
            catch (err2) {
                // ignore.
            }
        }
    });
}

/**
 * Launches a new process with the given command.
 * This is almost same as `child_process.spawn`.
 *
 * This returns a `ChildProcess` instance.
 * `kill` method of the instance kills the new process and its sub processes.
 *
 * @param {string} command - The command to run.
 * @param {string[]} args - List of string arguments.
 * @param {object} options - Options.
 * @returns {ChildProcess} A ChildProcess instance of new process.
 * @private
 */
export default function spawn(command, args, options) {
    const child = crossSpawn(command, args, options);
    child.kill = kill;

    return child;
}
