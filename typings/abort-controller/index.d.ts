/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
declare module "abort-controller" {
    interface AbortController {
        readonly signal: AbortSignal
        abort(): void
    }

    interface AbortSignal {
        readonly aborted: boolean
        onabort: Function | null
        addEventListener(
            type: string,
            listener: Function,
            options?:
                | boolean
                | { capture?: boolean; once?: boolean; passive?: boolean },
        ): void
        removeEventListener(
            type: string,
            listener: Function,
            options?: boolean | { capture?: boolean },
        ): void
    }

    export const AbortController: {
        prototype: AbortController
        new (): AbortController
    }

    export const AbortSignal: {
        prototype: AbortSignal
        new (): AbortSignal
    }
}
