/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
declare module "ps-tree" {
    function psTree(
        pid: number | string,
        callback: (err: null | null, children: { PID: string }[]) => void,
    ): void

    namespace psTree {

    }

    export = psTree
}
