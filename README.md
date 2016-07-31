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
$ npm-run-all clean lint build:*
```

```
$ npm-run-all --parallel watch:*
```

## Installation

```
$ npm install npm-run-all
```

- Requires `Node@>=0.10` and `npm@>=2`
- The `npm-run-all` package introduces 3 CLI commands: `npm-run-all`, `run-s`, and `run-p`.

## CLI Commands

This `npm-run-all` package provides 3 CLI commands.

- [npm-run-all]
- [run-s]
- [run-p]

The main command is [npm-run-all].
We can make complex plans with [npm-run-all] command.

Both [run-s] and [run-p] are shorthand commands.
[run-s] is for sequential, [run-p] is for parallel.
We can make simple plans with those commands.

## Node API

This `npm-run-all` package provides Node API.

- [Node API]

## Changelog

- https://github.com/mysticatea/npm-run-all/releases

## Contributing

Thank you for contributing!

### Bug Reports or Feature Requests

Please use GitHub Issues.

### Correct Documents

Please use GitHub Pull Requests.

I'm not familiar with English, so I especially thank you for documents' corrections.

### Feature Implementing

Please use GitHub Pull Requests.

There are some npm-scripts to help developments.
Those work on Windows, Mac, or Linux (by the way, I'm developping `npm-run-all` on Windows).

- **npm test** - Run tests and collect coverage.
- **npm run build** - Make `lib` directory from `src` directory.
- **npm run clean** - Delete directories (folders) which are created by other commands.
- **npm run lint** - Run ESLint.
- **npm run watch** - Run tests (not collect coverage) when each file was modified.

[npm-run-all]: docs/npm-run-all.md
[run-s]: docs/run-s.md
[run-p]: docs/run-p.md
[Node API]: docs/node-api.md
