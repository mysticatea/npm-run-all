| index | [npm-run-all] | [run-s] | [run-p] | [Node API] |
|-------|---------------|---------|---------|------------|

# npm-run-all

[![npm version](https://img.shields.io/npm/v/npm-run-all.svg)](https://www.npmjs.com/package/npm-run-all)
[![Downloads/month](https://img.shields.io/npm/dm/npm-run-all.svg)](http://www.npmtrends.com/npm-run-all)
[![Build Status](https://travis-ci.org/mysticatea/npm-run-all.svg?branch=master)](https://travis-ci.org/mysticatea/npm-run-all)
[![Build status](https://ci.appveyor.com/api/projects/status/v0owd44q1r7hceir/branch/master?svg=true)](https://ci.appveyor.com/project/mysticatea/npm-run-all/branch/master)
[![Coverage Status](https://coveralls.io/repos/mysticatea/npm-run-all/badge.svg?branch=master&service=github)](https://coveralls.io/github/mysticatea/npm-run-all?branch=master)
[![Dependency Status](https://david-dm.org/mysticatea/npm-run-all.svg)](https://david-dm.org/mysticatea/npm-run-all)

A CLI tool to run multiple npm-scripts in parallel or sequential.

```
> npm-run-all clean lint build:*
```

```
> npm-run-all clean --parallel "build:* -- --watch"
```

## Installation

```
npm install npm-run-all
```

- Requires `Node@>=0.10` and `npm@>=2`
- The `npm-run-all` package introduces 3 CLI commands: `npm-run-all`, `run-s`, and `run-p`.

## CLI Commands

This `npm-run-all` package introduces 3 CLI commands.

- [npm-run-all]
- [run-s]
- [run-p]

The main command is [npm-run-all].
We can make complex plans with [npm-run-all] command.

Both [run-s] and [run-p] are the shorthand commands.
[run-s] is for sequential, [run-p] is for parallel.
We can make simple plans with those commands.

## Node API

This `npm-run-all` package provides Node API.

- [Node API]


[npm-run-all]: docs/npm-run-all.md
[run-s]: docs/run-s.md
[run-p]: docs/run-p.md
[Node API]: docs/node-api.md
