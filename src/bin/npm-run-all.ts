/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import PQueue from "p-queue"
import { version } from "../../package.json"
import runScripts from "../lib"
import CLIParameterParserBase from "./cli-parameter-parser"

/**
 * CLI parameter parser.
 */
class CLIParameterParser extends CLIParameterParserBase {
    public groups: { patterns: string[]; parallel: boolean }[] = [
        { patterns: this.patterns, parallel: false },
    ]

    /** Initialize this parser. */
    public constructor(args: string[]) {
        super(args)
        Object.defineProperty(this, "groups", { enumerable: false })
    }

    /** Interprit the next argument */
    protected next(): void {
        const arg = this.args[this.index]
        switch (arg) {
            case "-s":
            case "--sequential":
            case "--serial": {
                const patterns = (this.patterns = [])
                this.index += 1
                this.groups.push({ patterns, parallel: false })
                break
            }

            case "-p":
            case "--parallel": {
                const patterns = (this.patterns = [])
                this.index += 1
                this.parallel = true
                this.groups.push({ patterns, parallel: true })
                break
            }

            default:
                super.next()
        }
    }
}

/*eslint-disable no-console, no-process-exit */
;(async (args: string[]) => {
    const arg = args[0]

    if (arg === undefined || arg === "-h" || arg === "--help") {
        console.log(`
Usage:
    $ npm-run-all [--help | -h | --version | -v]
    $ npm-run-all [scripts] [OPTIONS]

    Run given npm-scripts in parallel or sequential.

    <scripts> : A list of npm-scripts' names and Glob-like patterns.

Options:
    --aggregate-output   - - - Avoid interleaving output by delaying printing of
                               each command's output until it has finished.
    -c, --continue-on-error  - Set the flag to continue executing
                               other/subsequent scripts even if a task threw an
                               error. 'npm-run-all' itself will exit with
                               non-zero code if one or more scripts threw
                               error(s).
    --max-parallel <number>  - Set the maximum number of parallelism. Default is
                               unlimited.
    --npm-path <string>  - - - Set the path to npm. Default is the value of
                               environment variable npm_execpath.
                               If the variable is not defined, then it's "npm".
                               In this case, the "npm" command must be found in
                               environment variable PATH.
    -l, --print-label  - - - - Set the flag to print the task name as a prefix
                               on each line of output. Tools in scripts may stop
                               coloring their output if this option was given.
    -n, --print-name   - - - - Set the flag to print the task name before
                               running each task.
    -p, --parallel <scripts> - Run a group of scripts in parallel.
                               e.g. 'npm-run-all -p foo bar' is similar to
                                    'npm run foo & npm run bar'.
    -r, --race   - - - - - - - Set the flag to kill all scripts when a task
                               finished with zero. This option is valid only
                               with 'parallel' option.
    -s, --sequential <scripts> Run a group of scripts sequentially.
        --serial <scripts>     e.g. 'npm-run-all -s foo bar' is similar to
                               'npm run foo && npm run bar'.
                               '--serial' is a synonym of '--sequential'.
    --silent   - - - - - - - - Set 'silent' to the log level of npm.

Examples:
    $ npm-run-all --serial clean lint build:**
    $ npm-run-all --parallel watch:**
    $ npm-run-all clean lint --parallel "build:** -- --watch"
    $ npm-run-all -l -p start-server start-browser start-electron

See Also:
    https://github.com/mysticatea/npm-run-all#readme
`)
        process.exitCode = arg === undefined ? 1 : 0
        return
    }
    if (arg === "-v" || arg === "--version") {
        console.log(`v${version}`)
        return
    }

    // https://github.com/mysticatea/npm-run-all/issues/105
    // Avoid MaxListenersExceededWarnings.
    process.stdout.setMaxListeners(0)
    process.stderr.setMaxListeners(0)
    process.stdin.setMaxListeners(0)

    // Main
    const queue = new PQueue({ concurrency: 1 })
    const options = new CLIParameterParser(args)

    await queue.addAll(
        options.groups.map(g => () =>
            runScripts(
                g.patterns,
                Object.assign({}, options, { parallel: g.parallel }),
            ),
        ),
    )
})(process.argv.slice(2)).then(
    () => {
        // I'm not sure why, but maybe the process never exits on Git Bash (MINGW64)
        process.exit(0)
    },
    error => {
        console.error(error.stack)
        process.exit(1)
    },
)

/*eslint-enable */
