/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import { Options } from "../lib"

/*eslint-disable no-process-env */

const OVERWRITE_OPTION = /^--([^:]+?):([^=]+?)(?:=(.+))?$/
const CONFIG_OPTION = /^--([^=]+?)(?:=(.+))$/
const PACKAGE_CONFIG_PATTERN = /^npm_package_config_(.+)$/
const CONCAT_OPTIONS = /^-[clnprs]+$/

/**
 * Overwrites a specified package config.
 */
function overwriteConfig(
    config: { [key: string]: { [key: string]: string } },
    packageName: string,
    variable: string,
    value: string,
): void {
    const scope = config[packageName] || (config[packageName] = {})
    scope[variable] = value
}

/**
 * Creates a package config object.
 * This checks `process.env` and creates the default value.
 */
function createPackageConfig(): { [key: string]: { [key: string]: string } } {
    const retv: { [key: string]: { [key: string]: string } } = {}
    const packageName = process.env.npm_package_name
    if (!packageName) {
        return retv
    }

    for (const key of Object.keys(process.env)) {
        const m = PACKAGE_CONFIG_PATTERN.exec(key)
        if (m != null) {
            overwriteConfig(retv, packageName, m[1], process.env[key] as string)
        }
    }

    return retv
}

/**
 * Common CLI parameters of npm-run-all, run-s, and run-p.
 */
export default class CLIParameterParser implements Options {
    protected args: string[]
    protected index = 0

    public patterns: string[] = []

    public config: { [key: string]: string } = {}
    public packageConfig = createPackageConfig()
    public arguments: string[] = []
    public parallel: boolean
    public silent = process.env.npm_config_loglevel === "silent"
    public continueOnError = false
    public printLabel = false
    public printName = false
    public race = false
    public aggregateOutput = false
    public maxParallel = 1
    public npmPath: string | undefined = undefined

    /** Initialize this parser */
    public constructor(args: string[], parallel = false) {
        this.args = args
        this.parallel = parallel

        Object.defineProperties(this, {
            args: { enumerable: false },
            index: { enumerable: false },
            patterns: { enumerable: false },
        })

        while (this.index < this.args.length) {
            this.next()
        }

        if (!this.parallel) {
            if (this.aggregateOutput) {
                throw new Error(
                    "Invalid Option: --aggregate-output (without parallel)",
                )
            }
            if (this.race) {
                throw new Error(`Invalid Option: --race (without parallel)`)
            }
            if (this.maxParallel !== 0) {
                throw new Error(
                    "Invalid Option: --max-parallel (without parallel)",
                )
            }
        }
    }

    //eslint-disable-next-line complexity, require-jsdoc
    protected next(): void {
        const arg = this.args[this.index++]
        switch (arg) {
            case "--":
                this.arguments = this.args.slice(this.index)
                this.index = this.args.length
                break

            case "--aggregate-output":
                this.aggregateOutput = true
                break

            case "--color":
            case "--no-color":
                // passthrough for chalk package.
                break

            case "-c":
            case "--continue-on-error":
                this.continueOnError = true
                break

            case "-l":
            case "--print-label":
                this.printLabel = true
                break

            case "-n":
            case "--print-name":
                this.printName = true
                break

            case "-r":
            case "--race":
                this.race = true
                break

            case "-s":
            case "--silent":
                this.silent = true
                break

            case "--max-parallel": {
                const value = this.args[this.index++]
                this.maxParallel = parseInt(value, 10)
                if (
                    !Number.isFinite(this.maxParallel) ||
                    this.maxParallel <= 0
                ) {
                    throw new Error(`Invalid Option: --max-parallel ${value}`)
                }
                break
            }

            case "--npm-path":
                this.npmPath = this.args[this.index++]
                break

            default: {
                let matched = null
                if ((matched = OVERWRITE_OPTION.exec(arg))) {
                    overwriteConfig(
                        this.packageConfig,
                        matched[1],
                        matched[2],
                        matched[3] || this.args[this.index++],
                    )
                } else if ((matched = CONFIG_OPTION.exec(arg))) {
                    this.config[matched[1]] = matched[2]
                } else if (CONCAT_OPTIONS.test(arg)) {
                    this.args.splice(
                        this.index,
                        0,
                        ...arg
                            .slice(1)
                            .split("")
                            .map(c => `-${c}`),
                    )
                } else if (arg[0] === "-") {
                    throw new Error(`Invalid Option: ${arg}`)
                } else {
                    this.patterns.push(arg)
                }

                break
            }
        }
    }
}

/*eslint-enable */
