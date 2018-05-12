/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import ansiStyles from "ansi-styles"
import { PackageInfo } from "../package-info"

/**
 * Creates the header text for a given script name.
 */
export function createScriptHeader(
    nameAndArgs: string,
    packageInfo: PackageInfo,
    isTTY: boolean,
): string {
    const color = isTTY ? ansiStyles.gray : { open: "", close: "" }
    if (!packageInfo) {
        return `\n${color.open}> ${nameAndArgs}${color.close}\n\n`
    }

    const index = nameAndArgs.indexOf(" ")
    const scriptName = index === -1 ? nameAndArgs : nameAndArgs.slice(0, index)
    const args = index === -1 ? "" : nameAndArgs.slice(index + 1)
    const rawData = packageInfo.rawData
    const name = rawData.name
    const version = rawData.version
    const scriptBody = rawData.scripts && rawData.scripts[scriptName]
    const packagePath = packageInfo.filePath

    return `
${color.open}> ${name}@${version} ${scriptName} ${packagePath}${color.close}
${color.open}> ${scriptBody} ${args}${color.close}

`
}
