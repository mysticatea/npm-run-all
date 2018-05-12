/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import { ChildProcess, SpawnOptions } from "child_process"
import spawn0 from "cross-spawn"
import getDescendentProcessInfo from "ps-tree"

/**
 * Kill child processes recursively for POSIX.
 */
function kill(this: ChildProcess): void {
    getDescendentProcessInfo(this.pid, (err, descendent) => {
        if (err || !descendent) {
            return
        }

        for (const child of descendent) {
            try {
                process.kill(Number(child.PID))
            } catch (_err) {
                // ignore.
            }
        }
    })
}

/**
 * Spawn a child process.
 * This is almost same as `child_process.spawn`, but the `kill` method kills all descendant processes.
 */
export function spawn(
    command: string,
    args: string[],
    options: SpawnOptions,
): ChildProcess {
    const child = spawn0(command, args, options)
    child.kill = kill

    return child
}
