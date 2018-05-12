/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import { version } from "../../package.json"
import runScripts from "../lib"
import CLIParameterParser from "./cli-parameter-parser"

/*eslint-disable no-console, no-process-exit */
;(async (args: string[]) => {
    const arg = args[0]

    if (arg === undefined || arg === "-h" || arg === "--help") {
        console.log(`
Usage:
    $ run-p [--help | -h | --version | -v]
    $ run-p [OPTIONS] <scripts>

    Run given npm-scripts in parallel.

    <scripts> : A list of npm-scripts' names and Glob-like patterns.

Options:
    --aggregate-output   - - - Avoid interleaving output by delaying printing of
                               each command's output until it has finished.
    -c, --continue-on-error  - Set the flag to continue executing other scripts
                               even if a task threw an error. 'run-p' itself
                               will exit with non-zero code if one or more
                               scripts threw error(s).
    --max-parallel <number>  - Set the maximum number of parallelism. Default is
                               unlimited.
    --npm-path <string>  - - - Set the path to npm. Default is the value of
                               environment variable npm_execpath.
                               If the variable is not defined, then it's "npm."
                               In this case, the "npm" command must be found in
                               environment variable PATH.
    -l, --print-label  - - - - Set the flag to print the task name as a prefix
                               on each line of output. Tools in scripts may stop
                               coloring their output if this option was given.
    -n, --print-name   - - - - Set the flag to print the task name before
                               running each task.
    -r, --race   - - - - - - - Set the flag to kill all scripts when a task
                               finished with zero.
    -s, --silent   - - - - - - Set 'silent' to the log level of npm.

    Shorthand aliases can be combined.
    For example, '-clns' equals to '-c -l -n -s'.

Examples:
    $ run-p watch:**
    $ run-p --print-label "build:** -- --watch"
    $ run-p -sl "build:** -- --watch"
    $ run-p start-server start-browser start-electron

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
    const options = new CLIParameterParser(args, true)
    await runScripts(options.patterns, options)
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
