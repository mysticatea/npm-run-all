/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import path from "path"
import fs from "fs-extra"

/**
 * Ensure x is an object.
 */
//eslint-disable-next-line require-jsdoc, mysticatea/ts/no-explicit-any
function ensureObject(x: any): { [key: string]: any } {
    return typeof x === "object" && x !== null ? x : {}
}

/**
 * Information of package.json.
 */
export interface PackageInfo {
    filePath?: string
    taskList: string[]

    //eslint-disable-next-line mysticatea/ts/no-explicit-any
    rawData: { [key: string]: any }
}

/**
 * Reads the package.json in the current directory.
 */
export async function readPackageInfo(): Promise<PackageInfo> {
    const filePath = path.join(process.cwd(), "package.json")
    const rawData = ensureObject(await fs.readJSON(filePath))
    const scripts = ensureObject(rawData.scripts)
    const taskList = Object.keys(scripts)

    return { filePath, taskList, rawData }
}
