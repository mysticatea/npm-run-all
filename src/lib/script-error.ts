/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import { ScriptResult } from "./script-result"

/**
 * Error object with some additional info.
 */
export class ScriptError extends Error {
    public causeResult: ScriptResult
    public allResults: ScriptResult[]

    /**
     * Initialize this error.
     */
    public constructor(causeResult: ScriptResult, allResults: ScriptResult[]) {
        super(`"${causeResult.name}" exited with ${causeResult.code}.`)
        this.causeResult = causeResult
        this.allResults = allResults
    }
}
