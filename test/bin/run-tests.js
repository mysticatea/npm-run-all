/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2017 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

/*
 * Run tests in parallel.
 * This can reduce the spent time of tests to 1/3, but this is badly affecting to the timers in tests.
 * I need more investigation.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const spawn = require("child_process").spawn
const path = require("path")
const os = require("os")
const fs = require("fs-extra")
const PQueue = require("p-queue")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

const ROOT_PATH = path.resolve(__dirname, "../")
const WORKSPACE_PATH = path.resolve(__dirname, "../../test-workspace")
const MOCHA_PATH = path.resolve(__dirname, "../../node_modules/mocha/bin/_mocha")

/**
 * Convert a given duration in seconds to a string.
 * @param {number} durationInSec A duration to convert.
 * @returns {string} The string of the duration.
 */
function durationToText(durationInSec) {
    return `${durationInSec / 60 | 0}m ${durationInSec % 60 | 0}s`
}

/**
 * Run a given test file.
 * @param {string} filePath The absolute path to a test file.
 * @param {string} workspacePath The absolute path to the workspace directory.
 * @returns {Promise<{duration:number,exitCode:number,failing:number,id:string,passing:number,text:string}>}
 * - `duration` is the spent time in seconds.
 * - `exitCode` is the exit code of the child process.
 * - `failing` is the number of failed tests.
 * - `id` is the name of this tests.
 * - `passing` is the number of succeeded tests.
 * - `text` is the result text of the child process.
 */
function runMocha(filePath, workspacePath) {
    return new Promise((resolve, reject) => {
        const startInSec = process.uptime()
        const cp = spawn(
            process.execPath,
            [MOCHA_PATH, filePath, "--reporter", "dot", "--timeout", "120000"],
            { cwd: workspacePath, stdio: ["ignore", "pipe", "inherit"] }
        )

        let resultText = ""

        cp.stdout.setEncoding("utf8")
        cp.stdout.on("data", (rawChunk) => {
            const chunk = rawChunk.trim().replace(/^[․.!]+/, (dots) => {
                process.stdout.write(dots)
                return ""
            })
            if (chunk) {
                resultText += chunk
                resultText += "\n\n"
            }
        })

        cp.on("exit", (exitCode) => {
            let passing = 0
            let failing = 0
            const text = resultText
                .replace(/(\d+) passing\s*\(.+?\)/, (_, n) => {
                    passing += Number(n)
                    return ""
                })
                .replace(/(\d+) failing\s*/, (_, n) => {
                    failing += Number(n)
                    return ""
                })
                .replace(/^\s*\d+\)/gm, "")
                .split("\n")
                .filter(line => !line.includes("empower-core"))
                .join("\n")
                .trim()

            resolve({
                duration: process.uptime() - startInSec,
                exitCode,
                failing,
                id: path.basename(filePath, ".js"),
                passing,
                text,
            })
        })
        cp.on("error", reject)
    })
}

/**
 * Run a given test file.
 * @param {string} filePath The absolute path to a test file.
 * @returns {Promise<{duration:number,exitCode:number,failing:number,id:string,passing:number,text:string}>}
 * - `duration` is the spent time in seconds.
 * - `exitCode` is the exit code of the child process.
 * - `failing` is the number of failed tests.
 * - `id` is the name of this tests.
 * - `passing` is the number of succeeded tests.
 * - `text` is the result text of the child process.
 */
async function runMochaWithWorkspace(filePath) {
    const basename = path.basename(filePath, ".js")
    const workspacePath = path.resolve(__dirname, `../../test-workspace-${basename}`)

    await fs.remove(workspacePath)
    await fs.copy(WORKSPACE_PATH, workspacePath, { dereference: true, recursive: true })
    try {
        return await runMocha(filePath, workspacePath)
    }
    finally {
        try {
            await fs.remove(workspacePath)
        }
        catch (_error) {
            // ignore to keep the original error.
        }
    }
}

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------

(async () => {
    const startInSec = process.uptime()
    const queue = new PQueue({ concurrency: os.cpus().length + 1 })
    const results = await Promise.all(
        (await fs.readdir(ROOT_PATH))
            .filter(fileName => path.extname(fileName) === ".js")
            .map(fileName => path.join(ROOT_PATH, fileName))
            .map(filePath => queue.add(() => runMochaWithWorkspace(filePath)))
    )

    process.stdout.write("\n\n")

    for (const result of results) {
        if (result.text) {
            process.stdout.write(`\n${result.text}\n\n`)
        }
        if (result.exitCode) {
            process.exitCode = 1
        }
    }

    let passing = 0
    let failing = 0
    for (const result of results) {
        passing += result.passing
        failing += result.failing
        process.stdout.write(`\n${result.id}: passing ${result.passing} failing ${result.failing} (${durationToText(result.duration)})`)
    }
    process.stdout.write(`\n\nTOTAL: passing ${passing} failing ${failing} (${durationToText(process.uptime() - startInSec)})\n\n`)
})().catch(error => {
    process.stderr.write(`\n\n${error.stack}\n\n`)
    process.exit(1) //eslint-disable-line no-process-exit
})
