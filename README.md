# npm-run-all

[![Build Status](https://travis-ci.org/mysticatea/npm-run-all.svg?branch=master)](https://travis-ci.org/mysticatea/npm-run-all)
[![npm version](https://badge.fury.io/js/npm-run-all.svg)](http://badge.fury.io/js/npm-run-all)

A CLI tool to run multiple npm-scripts on sequential or parallel.


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

### Run tasks on sequential

```
npm-run-all build:html build:js
```

This is same as `npm run build:html && npm run build:js`.

### Run tasks on parallel

```
npm-run-all --parallel watch:html watch:js
```

This is same as `npm run watch:html & npm run watch:js`.

Of course, this can be run on **Windows** as well!

### Run tasks on mixed sequential and parallel.

```
npm-run-all clean lint --parallel watch:html watch:js
```

1. First, this runs `clean` and `lint` sequentially.
2. Next, runs `build:html` and `build:js` parallelly.

```
npm-run-all a b --parallel c d --sequential e f --parallel g h i
```

1. First, runs `a` and `b` sequentially.
2. Second, runs `c` and `d` parallelly.
3. Third, runs `e` and `f` sequentially.
4. Lastly, runs `g`, `h`, and `i` parallelly.


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
  * **options.parallel** `boolean` -- A flag to run tasks on parallel. By default,
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

`runAll` returns a promise that becomes *fulfilled* when done all tasks.
The promise will become *rejected* when any of tasks exited with non-zero code.
