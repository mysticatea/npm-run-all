| [index](../README.md) | npm-run-all | [run-s](run-s.md) | [run-p](run-p.md) | [Node API](node-api.md) |
|-----------------------|-------------|-------------------|-------------------|-------------------------|

# `npm-run-all` command

A CLI command to run given npm-scripts in parallel or sequential.

```
> npm-run-all clean lint build:*

> npm-run-all --parallel watch:*
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
    $ npm-run-all [--help | -h | --version | -v]
    $ npm-run-all [tasks] [OPTIONS]

    Run given npm-scripts in parallel or sequential.

    <tasks> : A list of npm-scripts' names and Glob-like patterns.

Options:
    -c, --continue-on-error  - Set the flag to continue executing
                               other/subsequent tasks even if a task threw an
                               error. 'npm-run-all' itself will exit with
                               non-zero code if one or more tasks threw error(s)
    -l, --print-label  - - - - Set the flag to print the task name as a prefix
                               on each line of output. Tools in tasks may stop
                               coloring their output if this option was given.
    -n, --print-name   - - - - Set the flag to print the task name before
                               running each task.
    -p, --parallel <tasks>   - Run a group of tasks in parallel.
                               e.g. 'npm-run-all -p foo bar' is similar to
                                    'npm run foo & npm run bar'.
    -s, --sequential <tasks> - Run a group of tasks sequentially.
        --serial <tasks>       e.g. 'npm-run-all -s foo bar' is similar to
                                    'npm run foo && npm run bar'.
                               '--serial' is a synonym of '--sequential'.
    --silent   - - - - - - - - Set 'silent' to the log level of npm.

Examples:
    $ npm-run-all --serial clean lint build:**
    $ npm-run-all --parallel watch:**
    $ npm-run-all clean lint --parallel "build:** -- --watch"
    $ npm-run-all -l -p start-server start-browser start-electron
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
On the other hand, this `npm-run-all` command runs multiple scripts in parallel or sequential.

### Run scripts sequentially

```
npm-run-all build:html build:js
```

This is same as `npm run build:html && npm run build:js`.

**Note:** If a script exited with non zero code, the following scripts are not run.
If `--continue-on-error` option is given, this behavior will be disabled.

### Run scripts in parallel

```
npm-run-all --parallel watch:html watch:js
```

This is similar to `npm run watch:html & npm run watch:js`.

**Note:** If a script exited with a non-zero code, the other scripts and those descendant processes are killed with `SIGTERM` (On Windows, with `taskkill.exe /F /T`).
If `--continue-on-error` option is given, this behavior will be disabled.

### Run a mix of sequential and parallel scripts

```
npm-run-all clean lint --parallel watch:html watch:js
```

1. First, this runs `clean` and `lint` sequentially / serially.
2. Next, runs `watch:html` and `watch:js` in parallell.

```
npm-run-all a b --parallel c d --sequential e f --parallel g h i
```
or

```
npm-run-all a b --parallel c d --serial e f --parallel g h i
```

1. First, runs `a` and `b` sequentially / serially.
2. Second, runs `c` and `d` in parallell.
3. Third, runs `e` and `f` sequentially / serially.
4. Lastly, runs `g`, `h`, and `i` in parallell.

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
