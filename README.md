# npm-run-all

[![Build Status](https://travis-ci.org/mysticatea/npm-run-all.svg?branch=master)](https://travis-ci.org/mysticatea/npm-run-all)
[![npm version](https://badge.fury.io/js/npm-run-all.svg)](http://badge.fury.io/js/npm-run-all)

A CLI tool to run multiple npm-scripts sequentially or in parallel.

## Platform dependencies

This package works in both Windows and UNIX-like environments.

It requires at least node version 0.10 and **npm version 2.0.0**. To upgrade npm, run:

```
npm install -g npm@latest
```

## Installation

```
npm install npm-run-all
```


## Usage

```
Usage: npm-run-all [OPTIONS] [...tasks]

  Run specified tasks.

  Options:
    -h, --help                  Print this text.
    -p, --parallel [...tasks]   Grouping tasks to run on parallel.
    -s, --sequential [...tasks] Grouping tasks to run on sequential.
    -v, --version               Print version number.
```

### Run tasks sequentially

```
npm-run-all build:html build:js
```

This is same as `npm run build:html && npm run build:js`.

### Run tasks in parallel

```
npm-run-all --parallel watch:html watch:js
```

This is same as `npm run watch:html & npm run watch:js`.

Of course, this can be run on **Windows** as well!

### Run a mix of sequential and parallel tasks.

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


## Node API

```
var runAll = require("npm-run-all");
```

### runAll

```
var promise = runAll(tasks, options);
```

Run npm-scripts.

* **tasks** `string|string[]` -- Task names.
* **options** `object`
  * **options.parallel** `boolean` -- A flag to run tasks in parallel. By default,
    `false`.
  * **options.stdin** `stream.Readable` -- A readable stream that sends to stdin
    of tasks. By default, nothing. Set `process.stdin` in order to send from
    key inputs.
  * **options.stdout** `stream.Writable` -- A writable stream that receives stdout
    of tasks. By default, nothing. Set `process.stdout` in order to print to
    console.
  * **options.stderr** `stream.Writable` -- A writable stream that receives stderr
    of tasks. By default, nothing. Set `process.stderr` in order to print to
    console.

`runAll` returns a promise that becomes *fulfilled* when all tasks are completed.
The promise will become *rejected* when any of the tasks exit with a non-zero code.
