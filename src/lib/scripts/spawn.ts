/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import { ChildProcess, SpawnOptions } from "child_process"

const implPromise =
    process.platform === "win32"
        ? import("./spawn/win32")
        : import("./spawn/posix")

/**
 * Spawn a child process.
 * This is almost same as `child_process.spawn`, but the `kill` method kills all descendant processes.
 */
export async function spawn(
    command: string,
    args: string[],
    options: SpawnOptions,
): Promise<ChildProcess> {
    return (await implPromise).spawn(command, args, options)
}
