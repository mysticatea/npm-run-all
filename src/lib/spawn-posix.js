/**
 * @author Toru Nagashima
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
import cp from "child_process";

// List of child processes that are running currently.
const children = [];

/**
 * Removes this process from the children pool.
 * @this ChildProcess
 */
function removeFromPool() {
    const index = children.indexOf(this);
    if (index !== -1) {
        children.splice(index, 1);
    }
}

/**
 * Kills this process and sub processes with the process group ID.
 * @this ChildProcess
 */
function kill() {
    try {
        process.kill(-this.pid);
    }
    catch (err) {
        // ignore.
    }
}

/**
 * Launches a new process with the given command.
 * This is almost same as `child_process.spawn`.
 *
 * This detaches the new process to make new process group.
 * And if this process exited before the new process exits, this kills the new process.
 *
 * This returns a `ChildProcess` instance.
 * `kill` method of the instance kills the new process and its sub processes with the process group ID.
 *
 * @param {string} command - The command to run.
 * @param {string[]} args - List of string arguments.
 * @param {object} options - Options.
 * @returns {ChildProcess} A ChildProcess instance of new process.
 * @private
 */
export default function spawn(command, args, options) {
    options.detached = true; // eslint-disable-line no-param-reassign

    const child = cp.spawn(command, args, options);
    child.on("exit", removeFromPool);
    child.on("error", removeFromPool);
    child.kill = kill;

    // Add to the pool to kill on exit.
    children.push(child);

    return child;
}

// Kill all child processes on exit.
process.on("exit", () => {
    for (const child of children) {
        child.kill();
    }
});
