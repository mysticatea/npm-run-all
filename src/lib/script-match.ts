/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import { Minimatch } from "minimatch"

const COLON_OR_SLASH = /[:/]/g
const CONVERT_MAP = { ":": "/", "/": ":" }

/**
 * Swaps ":" and "/", in order to use ":" as the separator in minimatch.
 */
function swapColonAndSlash(s: string): string {
    return s.replace(
        COLON_OR_SLASH,
        matched => CONVERT_MAP[matched as ":" | "/"],
    )
}

/**
 * The filter of glob-like pattern.
 */
class PatternFilter {
    public readonly name: string
    public readonly args: string
    public readonly match: (name: string) => boolean

    /**
     * Create new filter.
     */
    public static new(pattern: string): PatternFilter {
        return new PatternFilter(pattern)
    }

    /**
     * Initialize this filter.
     */
    public constructor(pattern: string) {
        const trimmed = pattern.trim()
        const spacePos = trimmed.indexOf(" ")
        const name = spacePos < 0 ? trimmed : trimmed.slice(0, spacePos)
        const matcher = new Minimatch(swapColonAndSlash(name))

        this.name = name
        this.args = spacePos < 0 ? "" : trimmed.slice(spacePos)
        this.match = matcher.match.bind(matcher)
    }
}

/**
 * The set to remove overlapped task.
 */
class ScriptSet {
    private nameMap: {
        [name: string]: Set<string> | undefined
    } = Object.create(null)
    public commands: string[] = []

    /**
     * Adds a command (a pattern) into this set if it's not overlapped.
     * "Overlapped" is meaning that the command was added from a different source.
     */
    public add(command: string, nameOfSourcePattern: string): void {
        const names =
            this.nameMap[command] || (this.nameMap[command] = new Set<string>())
        if (names.has(nameOfSourcePattern)) {
            this.commands.push(command)
        }
        names.add(nameOfSourcePattern)
    }
}

/**
 * Enumerates tasks which matches with given patterns.
 */
export function getMatchedScriptNames(
    taskList: string[],
    patterns: string[],
): string[] {
    const filters = patterns.map(PatternFilter.new)
    const candidates = taskList.map(swapColonAndSlash)
    const scriptSet = new ScriptSet()
    const unknownSet = new Set<string>()

    // Take tasks while keep the order of patterns.
    for (const filter of filters) {
        let found = false

        for (const candidate of candidates) {
            if (filter.match(candidate)) {
                found = true
                scriptSet.add(
                    swapColonAndSlash(candidate) + filter.args,
                    filter.name,
                )
            }
        }

        // Built-in tasks should be allowed.
        if (!found && (filter.name === "restart" || filter.name === "env")) {
            scriptSet.add(filter.name + filter.args, filter.name)
            found = true
        }
        if (!found) {
            unknownSet.add(filter.name)
        }
    }

    if (unknownSet.size > 0) {
        throw new Error(
            `Script not found: "${Array.from(unknownSet).join('", ')}"`,
        )
    }
    return scriptSet.commands
}
