/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import { AbortController, AbortSignal } from "abort-controller"
import PQueue from "p-queue"
import shellQuote from "shell-quote"
import { runScript, RunScriptOptions } from "./scripts/run"
import { AggregateStream } from "./aggregate-stream"
import { readPackageInfo, PackageInfo } from "./package-info"
import { ScriptError } from "./script-error"
import { getMatchedScriptNames } from "./script-match"
import { ScriptResult } from "./script-result"

const ARGS_PATTERN = /\{(!)?([*@]|\d+)([^}]+)?}/g

/**
 * Normalized options.
 */
interface NormalizedOptions extends RunScriptOptions {
    aggregateOutput: boolean
    continueOnError: boolean
    maxParallel: number
    race: boolean
    signal: AbortSignal | null
}

/**
 * Converts a given value to an array.
 */
function ensureArray(x: string | string[] | null | undefined): string[] {
    if (x == null) {
        return []
    }
    return Array.isArray(x) ? x : [x]
}

/**
 * Replaces argument placeholders (such as `{1}`) by arguments.
 */
function applyArguments(patterns: string[], args: string[]): string[] {
    const defaults = Object.create(null)

    return patterns.map(pattern =>
        pattern.replace(
            ARGS_PATTERN,
            (
                whole: string,
                indirectionMark: string,
                id: string,
                options: string,
            ): string => {
                if (indirectionMark != null) {
                    throw Error(`Invalid Placeholder: ${whole}`)
                }
                if (id === "@") {
                    return shellQuote.quote(args)
                }
                if (id === "*") {
                    return shellQuote.quote([args.join(" ")])
                }

                const position = parseInt(id, 10)
                if (position >= 1 && position <= args.length) {
                    return shellQuote.quote([args[position - 1]])
                }

                // Address default values
                if (options != null) {
                    const prefix = options.slice(0, 2)

                    if (prefix === ":=") {
                        defaults[id] = shellQuote.quote([options.slice(2)])
                        return defaults[id]
                    }
                    if (prefix === ":-") {
                        return shellQuote.quote([options.slice(2)])
                    }

                    throw Error(`Invalid Placeholder: ${whole}`)
                }
                if (defaults[id] != null) {
                    return defaults[id]
                }

                return ""
            },
        ),
    )
}

/**
 * Parse patterns.
 * In parsing process, it replaces argument placeholders (such as `{1}`) by arguments.
 */
function parsePatterns(
    patternOrPatterns: string | string[],
    args: string[],
): string[] {
    const patterns = ensureArray(patternOrPatterns)
    const hasPlaceholder = patterns.some(pattern => ARGS_PATTERN.test(pattern))

    return hasPlaceholder ? applyArguments(patterns, args) : patterns
}

/**
 * Converts a given config object to an `--:=` style option array.
 */
function toOverwriteOptions(config: {
    [key: string]: { [key: string]: string }
}): string[] {
    const options = []

    for (const packageName of Object.keys(config)) {
        const packageConfig = config[packageName]

        for (const variableName of Object.keys(packageConfig)) {
            const value = packageConfig[variableName]

            options.push(`--${packageName}:${variableName}=${value}`)
        }
    }

    return options
}

/**
 * Converts a given config object to an `--a=b` style option array.
 */
function toConfigOptions(config: { [key: string]: any }): string[] {
    return Object.keys(config).map(key => `--${key}=${config[key]}`)
}

/**
 * Gets the maximum length.
 */
function maxLength(length: number, name: string): number {
    return Math.max(name.length, length)
}

/**
 * Normalize options.
 */
//eslint-disable-next-line complexity, require-jsdoc
async function normalizeOptions(
    patternOrPatterns: string | string[],
    options?: Options,
): Promise<{ scriptNames: string[]; config: NormalizedOptions }> {
    const stdin = (options && options.stdin) || null
    const stdout = (options && options.stdout) || null
    const stderr = (options && options.stderr) || null
    const taskList = (options && options.taskList) || null
    const config = (options && options.config) || {}
    const packageConfig = (options && options.packageConfig) || {}
    const ddArgs = (options && options.arguments) || []
    const parallel = Boolean(options && options.parallel)
    const silent = Boolean(options && options.silent)
    const continueOnError = Boolean(options && options.continueOnError)
    const printLabel = Boolean(options && options.printLabel)
    const printName = Boolean(options && options.printName)
    const race = Boolean(options && options.race)
    const maxParallel = parallel
        ? (options && options.maxParallel) || Number.POSITIVE_INFINITY
        : 1
    const aggregateOutput = Boolean(options && options.aggregateOutput)
    const npmPath = (options && options.npmPath) || null
    const signal = (options && options.signal) || null
    const patterns = parsePatterns(patternOrPatterns, ddArgs)

    if (taskList != null && Array.isArray(taskList) === false) {
        throw new Error("Invalid options.taskList")
    }
    if (typeof maxParallel !== "number" || !(maxParallel >= 0)) {
        throw new Error("Invalid options.maxParallel")
    }
    if (!parallel && aggregateOutput) {
        throw new Error(
            "Invalid options.aggregateOutput; It requires options.parallel",
        )
    }
    if (!parallel && race) {
        throw new Error("Invalid options.race; It requires options.parallel")
    }

    const args = ([] as string[]).concat(
        silent ? ["--silent"] : [],
        packageConfig ? toOverwriteOptions(packageConfig) : [],
        config ? toConfigOptions(config) : [],
    )
    const packageInfo: PackageInfo =
        taskList != null ? { taskList, rawData: {} } : await readPackageInfo()
    const scriptNames = getMatchedScriptNames(packageInfo.taskList, patterns)
    const labelWidth = scriptNames.reduce(maxLength, 0)

    return {
        scriptNames,
        config: {
            stdin,
            stdout,
            stderr,
            args,
            continueOnError,
            aggregateOutput,
            race,
            maxParallel,
            npmPath,
            signal,
            scriptHeader: printName,
            scriptLabel: {
                enabled: printLabel,
                width: labelWidth,
                lastPrefix: "",
                lastIsLinebreak: true,
            },
            packageInfo,
        },
    }
}

/**
 * Create the child abort controller of a given signal.
 */
function inheritSignal(
    signal: AbortSignal | null,
): AbortController & { dispose(): void } {
    const ac = new AbortController() as AbortController & { dispose(): void }
    ac.dispose = () => {
        // do nothing.
    }

    if (signal) {
        if (signal.aborted) {
            ac.abort()
        } else {
            const onAbort = function(): void {
                signal.removeEventListener("abort", onAbort)
                ac.abort()
            }

            signal.addEventListener("abort", onAbort)
            ac.dispose = () => {
                signal.removeEventListener("abort", onAbort)
            }
        }
    }

    return ac
}

/**
 * Wrap for the aggregateOutput option.
 * @param options The options.
 * @param f The main logic.
 */
function wrapToAggregateOutput(
    options: NormalizedOptions,
    f: (options: NormalizedOptions) => Promise<ScriptResult>,
): () => Promise<ScriptResult> {
    if (options.aggregateOutput && options.stdout) {
        const stdout = options.stdout
        return async () => {
            const thisOptions = Object.assign({}, options, {
                stdout: new AggregateStream(),
            })
            try {
                return await f(thisOptions)
            } finally {
                try {
                    stdout.write(thisOptions.stdout.result())
                } catch (_err) {
                    // ignore.
                }
            }
        }
    }
    return () => f(options)
}

/**
 * Runs npm-scripts which are matched with given patterns.
 */
export default async function runScripts(
    patternOrPatterns: string | string[],
    options?: Options,
): Promise<ScriptResult[]> {
    const { scriptNames, config } = await normalizeOptions(
        patternOrPatterns,
        options,
    )
    if (scriptNames.length === 0) {
        return []
    }

    const queue = new PQueue({ concurrency: config.maxParallel })
    const ac = inheritSignal(config.signal)
    try {
        let error: Error | null = null

        // Run scripts.
        const results = await queue.addAll(
            scriptNames.map(name =>
                wrapToAggregateOutput(config, async thisOptions => {
                    try {
                        const ret = await runScript(
                            name,
                            thisOptions,
                            ac.signal,
                        )

                        // Aborts all scripts if it's an error.
                        if (ret.code) {
                            error = error || new ScriptError(ret, results)
                            if (!config.continueOnError) {
                                ac.abort()
                            }
                        }

                        // Aborts all scripts if options.race is true.
                        if (config.race && !ret.code) {
                            ac.abort()
                        }

                        return ret
                    } catch (e) {
                        error = error || e
                        if (!config.continueOnError) {
                            ac.abort()
                        }
                        return { name, code: undefined }
                    }
                }),
            ),
        )

        if (error) {
            throw error
        }
        return results
    } finally {
        ac.dispose()
    }
}
Object.assign(runScripts, { AbortController, AbortSignal, default: runScripts })

/**
 * Options.
 */
export interface Options {
    stdin?: NodeJS.ReadableStream
    stdout?: NodeJS.WritableStream & { isTTY?: boolean }
    stderr?: NodeJS.WritableStream & { isTTY?: boolean }
    taskList?: string[]
    config?: { [key: string]: string }
    packageConfig?: { [key: string]: { [key: string]: string } }
    arguments?: string[]
    parallel?: boolean
    silent?: boolean
    continueOnError?: boolean
    printLabel?: boolean
    printName?: boolean
    race?: boolean
    aggregateOutput?: boolean
    maxParallel?: number
    npmPath?: string
    signal?: AbortSignal
}
