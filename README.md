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
Usage: npm-run-all [OPTIONS] <task> [...tasks]

  Run specified tasks.

  Options:
    -h, --help      Print this text.
    -p, --parallel  Run specified tasks on parallel.
                    By default, run on sequential.
    -v, --version   Print version number.
```


## Examples

```json
{
  "scripts": {
    "build":        "npm-run-all build:html build:js build:babel",
    "build:html":   "cp src/client/*.{html,css} app/static/",
    "build:js":     "browserify src/client/index.js -o app/static/index.js",
    "build:babel":  "babel src/server -o app/server",

    "start": "npm run build && node app/server/index.js",
    "test": "mocha test --compilers js:babel/register",

    "testing":        "npm-run-all --parallel testing:html testing:js testing:babel testing:server testing:mocha",
    "testing:html":   "cpx \"src/client/*.{html,css}\" app/static/ --watch",
    "testing:js":     "watchify src/client/index.js -o app/static/index.js",
    "testing:babel":  "babel src/server -o app/server --watch --source-maps-inline",
    "testing:server": "node-dev app/server/index.js",
    "testing:mocha":  "mocha test --compilers js:babel/register --watch --colors",
  }
}
```

Pick up:

```
npm-run-all build:html build:js build:babel
```

is same as `npm run build:html && npm run build:js && npm run build:babel`.

```
npm-run-all --parallel testing:html testing:js testing:babel testing:server testing:mocha
```

is same as `npm run testing:html & npm run testing:js & npm run testing:babel & npm run testing:server & npm run testing:mocha`.
Of course, be possible to run on Windows as well!


## Node API

```
var runAll = require("npm-run-all");
```

### runAll

```
var promise = runAll(tasks, options);
```

Run npm-scripts.

* *tasks* `string|string[]` -- Task names.
* *options* `object`
  * *options.parallel* `boolean` -- A flag to run tasks on parallel. By default,
    `false`.
  * *options.stdin* `stream.Readable` -- A readable stream that sends to stdin
    of tasks. By default, nothing. Set `process.stdin` in order to send from
    key inputs.
  * *options.stdout* `stream.Writable` -- A writable stream that receives stdout
    of tasks. By default, nothing. Set `process.stdout` in order to print to
    console.
  * *options.stderr* `stream.Writable` -- A writable stream that receives stderr
    of tasks. By default, nothing. Set `process.stderr` in order to print to
    console.

`runAll` returns a promise that becomes *fulfilled* when done all tasks.
The promise will become *rejected* when any of tasks exited with non-zero code.
