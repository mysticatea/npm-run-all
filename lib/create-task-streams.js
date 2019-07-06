/**
 * @module create-task-streams
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const createWriteStream = require("fs").createWriteStream

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Creates output and error stream for a task
 *
 * @param {string} fileName - fileName
 * @returns {object} streams outStream errStream
 */
module.exports = function createTaskStreams(fileName) {
    if (!fileName) {
        return undefined
    }

    const sanitizedFileName = fileName.replace(/\W/g, "_")

    const outStream = createWriteStream(`${sanitizedFileName}.out`)
    const errStream = createWriteStream(`${sanitizedFileName}.err`)

    return { outStream, errStream }
}
