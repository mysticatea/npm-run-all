| [index](../README.md) | [npm-run-all](npm-run-all.md) | run-s | [run-p](run-p.md) | [Node API](node-api.md) |
|-----------------------|-------------------------------|-------|-------------------|-------------------------|

# `run-s` command

A CLI command to run given npm-scripts sequentially.
This command is the shorthand of `npm-run-all -s`.

```
> run-s lint build:* test
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
    $ run-s [--help | -h | --version | -v]
    $ run-s [OPTIONS] <tasks>

    Run given npm-scripts sequentially.

    <tasks> : A list of npm-scripts' names and Glob-like patterns.

Options:
    -c, --continue-on-error  - Set the flag to continue executing subsequent
                               tasks even if a task threw an error. 'run-s'
                               itself will exit with non-zero code if one or
                               more tasks threw error(s).
    -l, --print-label  - - - - Set the flag to print the task name as a prefix
                               on each line of output. Tools in tasks may stop
                               coloring their output if this option was given.
    -n, --print-name   - - - - Set the flag to print the task name before
                               running each task.
    -s, --silent   - - - - - - Set 'silent' to the log level of npm.

    Shorthand aliases can be combined.
    For example, '-clns' equals to '-c -l -n -s'.

Examples:
    $ run-s build:**
    $ run-s lint clean build:**
    $ run-s --silent --print-name lint clean build:**
    $ run-s -sn lint clean build:**
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
On the other hand, this `run-s` command runs multiple scripts sequentially.

The following 2 commands are the same.
The `run-s` command is shorter.

```
> run-s clean lint build
> npm run clean && npm run lint && npm run build
```

**Note:** If a script exited with a non-zero code, the following scripts are not run.

### Glob-like pattern matching for script names

We can use [glob]-like patterns to specify npm-scripts.
The difference is one -- the separator is `:` instead of `/`.

```
> run-s build:*
```

In this case, runs sub scripts of `build`. For example: `build:html`, `build:js`.
But, doesn't run sub-sub scripts. For example: `build:js:index`.

```
> run-s build:**
```

If we use a globstar `**`, runs both sub scripts and sub-sub scripts.

`run-s` reads the actual npm-script list from `package.json` in the current directory, then filters the scripts by glob-like patterns, then runs those.

### Run with arguments

We can enclose a script name or a pattern in quotes to use arguments.
The following 2 commands are the same.

```
> run-s start:server "delay 3000" start:client
> npm run start:server && npm run delay 3000 && npm run start:client
```

When we use a pattern, arguments are forwarded to every matched script.

### Known Limitations

- If `--print-label` option is given, some tools in scripts might stop coloring their output.
  Because some coloring library (e.g. [chalk]) will stop coloring if `process.stdout` is not a TTY.
  `run-s` changes the `process.stdout` of child processes to a pipe in order to add labels to the head of each line if `--print-label` option is given.<br>
  For example, [eslint] stops coloring under `run-s --print-label`. But [eslint] has `--colors` option to force coloring, we can use it.

[glob]: https://www.npmjs.com/package/glob#glob-primer
[chalk]: https://www.npmjs.com/package/chalk
[eslint]: https://www.npmjs.com/package/eslint
