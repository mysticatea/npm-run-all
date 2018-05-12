/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import { ChildProcess, SpawnOptions } from "child_process"
import readline from "readline"
import spawn0 from "cross-spawn"

// Catch SIGINT.
let rl: readline.ReadLine | null = null
process.on("newListener", type => {
    if (type === "SIGINT" && process.listenerCount("SIGINT") === 1) {
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })
        rl.on("SIGINT", process.emit.bind(process, "SIGINT"))
    }
})
process.on("removeListener", type => {
    if (type === "SIGINT" && rl && process.listenerCount("SIGINT") === 0) {
        rl.close()
        rl = null
    }
})

/**
 * Register a given child process to transfar SIGINT.
 */
function register(cp: ChildProcess): void {
    /*eslint-disable require-jsdoc */
    function onSIGINT(): void {
        cp.kill()
    }

    function onDead(): void {
        process.removeListener("SIGINT", onSIGINT)
        cp.removeListener("exit", onDead)
        cp.removeListener("error", onDead)
    }
    /*eslint-enable require-jsdoc */

    process.on("SIGINT", onSIGINT)
    cp.on("exit", onDead)
    cp.on("error", onDead)
}

/**
 * Kill child processes recursively for Windows.
 */
function kill(this: ChildProcess): void {
    spawn0("taskkill", ["/F", "/T", "/PID", String(this.pid)])
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

    // If stdin is not inherited, transfar signals to child process.
    if (options.stdio && options.stdio[0] !== process.stdin) {
        register(child)
    }

    return child
}
