/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import { ChildProcess } from "child_process"
import path from "path"
import { AbortSignal } from "abort-controller"
import chalk from "chalk"
import { parse as parseArgs } from "shell-quote"
import padEnd from "string.prototype.padend"
import { PackageInfo } from "../package-info"
import { ScriptResult } from "../script-result"
import { ScriptLabelTransform, ScriptLabelTransformState } from "./label"
import { createScriptHeader } from "./name"
import { spawn } from "./spawn"

// Color definitions
type Color = (...text: string[]) => string
const colors: Color[] = [
    chalk.cyan,
    chalk.green,
    chalk.magenta,
    chalk.yellow,
    chalk.red,
]
const defaultColor = ((s: string) => s) as Color

// Data to rotate colors
let colorIndex = 0
const scriptNamesToColors = new Map<string, Color>()

/**
 * Select a color from given script name.
 */
function selectColor(name: string): typeof colors[0] {
    let color = scriptNamesToColors.get(name)
    if (!color) {
        color = colors[colorIndex]
        colorIndex = (colorIndex + 1) % colors.length
        scriptNamesToColors.set(name, color)
    }
    return color
}

/**
 * Wraps stdout/stderr with a transform stream to add the script name as prefix.
 */
function wrapLabeling(
    name: string,
    outputStream: (NodeJS.WritableStream & { isTTY?: boolean }) | null,
    labelOptions: ScriptLabelOptions,
): NodeJS.WritableStream | null {
    if (outputStream == null || !labelOptions.enabled) {
        return outputStream
    }

    const label = padEnd(name, labelOptions.width)
    const color = outputStream.isTTY ? selectColor(name) : defaultColor
    const prefix = color(`[${label}] `)
    const transform = new ScriptLabelTransform(prefix, labelOptions)

    transform.pipe(outputStream)

    return transform
}

/**
 * Converts a given stream to an option for `child_process.spawn`.
 */
function detectStreamKind<
    T extends
        | (NodeJS.WritableStream & { isTTY?: boolean })
        | (NodeJS.ReadableStream & { isTTY?: boolean })
>(targetStream: T | null, std: T): T | "ignore" | "pipe" {
    if (targetStream == null) {
        return "ignore"
    }
    if (targetStream !== std) {
        return "pipe"
    }

    // For the workaround of https://github.com/nodejs/node/issues/5620
    if (!std.isTTY) {
        return "pipe"
    }

    return targetStream
}

/**
 * Normalize spawn arguments.
 * @param scriptName The script name to run.
 * @param npmPath0 The path to npm or yarn.
 * @param additionalArgs The additional arguments to exec.
 * @returns The normalized arguments.
 */
function normalizeSpawnArgs(
    scriptName: string,
    npmPath0: string | null,
    additionalArgs: string[],
): { execPath: string; execArgs: string[] } {
    const npmPath = npmPath0 || process.env.npm_execpath || "npm" //eslint-disable-line no-process-env
    const npmPathIsJs = /^\.m?js$/.test(path.extname(npmPath))
    const execPath = npmPathIsJs ? process.execPath : npmPath
    const isYarn = path.basename(npmPath).startsWith("yarn")
    const execArgs = ["run"]

    if (npmPathIsJs) {
        execArgs.unshift(npmPath)
    }

    if (!isYarn) {
        Array.prototype.push.apply(execArgs, additionalArgs)
    } else if (additionalArgs.indexOf("--silent") !== -1) {
        execArgs.push("--silent")
    }

    Array.prototype.push.apply(execArgs, parseArgs(scriptName))

    return { execPath, execArgs }
}

/**
 * Options for `--label` option.
 */
export interface ScriptLabelOptions extends ScriptLabelTransformState {
    enabled: boolean
    width: number
}

/**
 * Options for runScript().
 */
export interface RunScriptOptions {
    stdin: NodeJS.ReadableStream | null
    stdout: (NodeJS.WritableStream & { isTTY?: boolean }) | null
    stderr: (NodeJS.WritableStream & { isTTY?: boolean }) | null
    args: string[]
    packageInfo: PackageInfo
    scriptHeader: boolean
    scriptLabel: ScriptLabelOptions
    npmPath: string | null
}

/**
 * Run a npm-script of a given name.
 * The return value is a promise which has an extra method: `abort()`.
 * The `abort()` kills the child process to run the npm-script.
 */
export function runScript(
    name: string,
    options: RunScriptOptions,
    signal: AbortSignal,
): Promise<ScriptResult> {
    if (signal.aborted) {
        return Promise.resolve<ScriptResult>({ name, code: undefined })
    }
    return new Promise<ScriptResult>(async (resolve, reject) => {
        let cp: ChildProcess | null = null
        let error: Error | null = null

        const stdin = options.stdin
        const stdout = wrapLabeling(name, options.stdout, options.scriptLabel)
        const stderr = wrapLabeling(name, options.stderr, options.scriptLabel)
        const stdinKind = detectStreamKind(stdin, process.stdin)
        const stdoutKind = detectStreamKind(stdout, process.stdout)
        const stderrKind = detectStreamKind(stderr, process.stderr)

        // Print script name.
        if (options.scriptHeader && stdout && options.stdout) {
            stdout.write(
                createScriptHeader(
                    name,
                    options.packageInfo,
                    Boolean(options.stdout.isTTY),
                ),
            )
        }

        // Register to abort signal.
        //eslint-disable-next-line require-jsdoc
        function onAbort(): void {
            if (cp) {
                cp.kill()
            }
        }

        signal.addEventListener("abort", onAbort)

        // Execute.
        const { execPath, execArgs } = normalizeSpawnArgs(
            name,
            options.npmPath,
            options.args,
        )
        const execOptions = { stdio: [stdinKind, stdoutKind, stderrKind] }
        cp = await spawn(execPath, execArgs, execOptions)

        // Piping stdio.
        if (stdinKind === "pipe" && stdin) {
            stdin.pipe(cp.stdin)
        }
        if (stdoutKind === "pipe" && stdout) {
            cp.stdout.pipe(stdout, { end: false })
        }
        if (stderrKind === "pipe" && stderr) {
            cp.stderr.pipe(stderr, { end: false })
        }

        // Register handlers.
        cp.on("error", (e: Error) => {
            error = e
        })
        cp.on("close", (code: number | undefined) => {
            signal.removeEventListener("abort", onAbort)

            if (cp) {
                if (stdinKind === "pipe" && stdin) {
                    stdin.unpipe(cp.stdin)
                }
                if (stdoutKind === "pipe" && stdout) {
                    cp.stdout.unpipe(stdout)
                }
                if (stderrKind === "pipe" && stderr) {
                    cp.stderr.unpipe(stderr)
                }
                cp.removeAllListeners()
                cp = null
            }

            if (error) {
                reject(error)
            } else {
                resolve({ name, code })
            }
        })
    })
}
