| [index](../README.md) | [npm-run-all](npm-run-all.md) | [run-s](run-s.md) | run-p | [Node API](node-api.md) |
|-----------------------|-------------------------------|-------------------|-------|-------------------------|

# `run-p` command

A CLI command to run given npm-scripts in parallel.
This command is the shorthand of `npm-run-all -p`.

```
> run-p watch:*
```

## Installation

```
> npm install -g npm-run-all
```

- Requires `Node@>=0.10` and `npm@>=2`
- The `npm-run-all` package introduces 3 CLI commands: `npm-run-all`, `run-s`, and `run-p`.

## Usage

```
Usage:
    $ run-p [--help | -h | --version | -v]
    $ run-p [OPTIONS] <tasks>

    Run given npm-scripts in parallel.

    <tasks> : A list of npm-scripts' names and Glob-like patterns.

Options:
    -c, --continue-on-error  - Set the flag to continue executing other tasks
                               even if a task threw an error. 'run-p' itself
                               will exit with non-zero code if one or more tasks
                               threw error(s).
    -l, --print-label  - - - - Set the flag to print the task name as a prefix
                               on each line of output. Tools in tasks may stop
                               coloring their output if this option was given.
    -n, --print-name   - - - - Set the flag to print the task name before
                               running each task.
    -s, --silent   - - - - - - Set 'silent' to the log level of npm.

    Shorthand aliases can be combined.
    For example, '-clns' equals to '-c -l -n -s'.

Examples:
    $ run-p watch:**
    $ run-p --print-label "build:** -- --watch"
    $ run-p -l "build:** -- --watch"
    $ run-p start-server start-browser start-electron
```

### npm-scripts

It's `"scripts"` field of `package.json`.
For example:

```json
{
    "scripts": {
        "clean": "rimraf dist",
        "lint":  "eslint src",
        "build": "babel src -o lib"
    }
}
```

We can run a script with `npm run` command.
On the other hand, this `run-p` command runs multiple scripts in parallel.

The following 2 commands are similar.
The `run-p` command is shorter and **available on Windows**.

```
> run-p lint build
> npm run lint & npm run build
```

**Note:** If a script exited with a non-zero code, the other scripts and those descendant processes are killed with `SIGTERM` (On Windows, with `taskkill.exe /F /T`).
If `--continue-on-error` option is given, this behavior will be disabled.

### Glob-like pattern matching for script names

We can use [glob]-like patterns to specify npm-scripts.
The difference is one -- the separator is `:` instead of `/`.

```
> run-p watch:*
```

In this case, runs sub scripts of `watch`. For example: `watch:html`, `watch:js`.
But, doesn't run sub-sub scripts. For example: `watch:js:index`.

```
> run-p watch:**
```

If we use a globstar `**`, runs both sub scripts and sub-sub scripts.

`run-p` reads the actual npm-script list from `package.json` in the current directory, then filters the scripts by glob-like patterns, then runs those.

### Run with arguments

We can enclose a script name or a pattern in quotes to use arguments.
The following 2 commands are similar.

```
> run-p "build:* -- --watch"
> npm run build:aaa -- --watch & npm run build:bbb -- --watch
```

When we use a pattern, arguments are forwarded to every matched script.

[glob]: https://www.npmjs.com/package/glob#glob-primer
