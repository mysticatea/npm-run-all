/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import stream from "stream"

const ALL_BR = /\n/g

/**
 * Shared state in multiple streams.
 */
export interface ScriptLabelTransformState {
    lastPrefix: string
    lastIsLinebreak: boolean
}

/**
 * The transform stream to insert a specific prefix.
 *
 * Several streams can exist for the same output stream.
 * This stream will insert the prefix if the last output came from other instance.
 * To do that, this stream is using a shared state object.
 */
export class ScriptLabelTransform extends stream.Transform {
    private readonly prefix: string
    private readonly state: ScriptLabelTransformState

    /**
     * Initialize this stream.
     */
    public constructor(prefix: string, state: ScriptLabelTransformState) {
        super()
        this.prefix = prefix
        this.state = state
    }

    /**
     * Transforms the output chunk.
     */
    public _transform(
        chunk: any, //eslint-disable-line mysticatea/ts/no-explicit-any
        _encoding: string,
        callback: stream.TransformCallback,
    ) {
        const prefix = this.prefix
        const nPrefix = `\n${prefix}`
        const state = this.state
        const firstPrefix = state.lastIsLinebreak
            ? prefix
            : state.lastPrefix !== prefix
                ? "\n"
                : /* otherwise */ ""
        const prefixed = `${firstPrefix}${chunk}`.replace(ALL_BR, nPrefix)
        const index = prefixed.indexOf(
            prefix,
            Math.max(0, prefixed.length - prefix.length),
        )

        state.lastPrefix = prefix
        state.lastIsLinebreak = index !== -1

        callback(undefined, index !== -1 ? prefixed.slice(0, index) : prefixed)
    }
}
