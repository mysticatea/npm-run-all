# npm-run-all

[![Build Status](https://travis-ci.org/mysticatea/npm-run-all.svg)](https://travis-ci.org/mysticatea/npm-run-all)
[![Coverage Status](https://coveralls.io/repos/mysticatea/npm-run-all/badge.svg?branch=master&service=github)](https://coveralls.io/github/mysticatea/npm-run-all?branch=master)
[![Dependency Status](https://david-dm.org/mysticatea/npm-run-all.svg)](https://david-dm.org/mysticatea/npm-run-all)
[![devDependency Status](https://david-dm.org/mysticatea/npm-run-all/dev-status.svg)](https://david-dm.org/mysticatea/npm-run-all#info=devDependencies)<br>
[![npm version](https://img.shields.io/npm/v/npm-run-all.svg)](https://www.npmjs.com/package/npm-run-all)
[![Downloads/month](https://img.shields.io/npm/dm/npm-run-all.svg)](https://www.npmjs.com/package/npm-run-all)

A CLI tool to run multiple npm-scripts in parallel or sequential.

```
> npm-run-all clean lint build:*
```

## Installation

```
npm install npm-run-all
```

- This package works in both Windows and UNIX-like environments.
- This package is tested in the follow node versions.
  - `0.10` (*requires `npm >= 2.0.0`, so please run `npm install -g npm@latest`*)
  - `0.12`
  - `4.x`
  - `5.x`

## Usage

```
Usage: npm-run-all [OPTIONS] [...tasks]

  Run specified tasks.

  Options:
    -h, --help                  Print this text.
    -p, --parallel [...tasks]   Run a group of tasks in parallel.
    -s, --sequential [...tasks] Run a group of tasks sequentially.
    -v, --version               Print version number.
```

### Run tasks sequentially

```
npm-run-all build:html build:js
```

This is same as `npm run build:html && npm run build:js`.

**Note:** If a task exited with non zero code, the following tasks are not run.

### Run tasks in parallel

```
npm-run-all --parallel watch:html watch:js
```

This is same as `npm run watch:html & npm run watch:js`.<br>
Of course, this works on **Windows** as well!

**Note:** If a task exited with non zero code, the other tasks and those descendant processes are killed with `SIGTERM` (On Windows, with `taskkill.exe /F /T`).

### Run a mix of sequential and parallel tasks

```
npm-run-all clean lint --parallel watch:html watch:js
```

1. First, this runs `clean` and `lint` sequentially.
2. Next, runs `watch:html` and `watch:js` in parallell.

```
npm-run-all a b --parallel c d --sequential e f --parallel g h i
```

1. First, runs `a` and `b` sequentially.
2. Second, runs `c` and `d` in parallell.
3. Third, runs `e` and `f` sequentially.
4. Lastly, runs `g`, `h`, and `i` in parallell.

### Run with arguments

```
npm-run-all "delay 3000" --parallel watch:*
npm-run-all --parallel "build:* -- --watch"
```

We can enclose a script name or a pattern in quotes to use arguments.
When you use a pattern, arguments are forwarded to every matched task.

An example: https://gist.github.com/mysticatea/34949629c9e0a01a9e7d
See also: https://docs.npmjs.com/cli/run-script

### Glob-like pattern matching for task names

```
npm-run-all --parallel watch:*
```

In this case, runs sub tasks of `watch`. e.g. `watch:html`, `watch:js`.
But, doesn't run sub-sub tasks. e.g. `watch:js:index`.

`npm-run-all` reads the actual npm-script list from `package.json` in the current directory.

```
npm-run-all --parallel watch:**
```

If we use a globstar `**`, runs both sub tasks and sub-sub tasks.

This matching rule is similar to [glob](https://www.npmjs.com/package/glob#glob-primer).
The Difference is one -- the separator is `:`, instead of `/`.

## Node API

```
var runAll = require("npm-run-all");
```

### runAll

```
var promise = runAll(patterns, options);
```

Run npm-scripts.

- **patterns** `string|string[]` -- Glob-like patterns for task names.
- **options** `object`
  - **options.parallel** `boolean` --
    A flag to run tasks in parallel.
    Default is `false`.
  - **options.stdin** `stream.Readable|null` --
    A readable stream to send to the stdin of npm-scripts.
    Default is nothing.
    Set `process.stdin` in order to send from stdin.
  - **options.stdout** `stream.Writable|null` --
    A writable stream to receive from the stdout of npm-scripts.
    Default is nothing.
    Set `process.stdout` in order to print to stdout.
  - **options.stderr** `stream.Writable|null` --
    A writable stream to receive from the stderr of npm-scripts
    Default is nothing.
    Set `process.stderr` in order to print to stderr.
  - **options.taskList** `string[]|null` --
    A string array that is all task names.
    By default, reads from `package.json` in the current directory.
  - **options.packageConfig** `object|null` --
    A map-like object to overwrite package configs.
    Keys are package names.
    Every value is a map-like object (Pairs of variable name and value).
    e.g. `{"npm-run-all": {"test": 777, "test2": 333}}`
    Default is `null`.

`runAll` returns a promise that becomes *fulfilled* when all tasks are completed.
The promise will become *rejected* when any of the tasks exit with a non-zero code.

See also: https://doc.esdoc.org/github.com/mysticatea/npm-run-all/
