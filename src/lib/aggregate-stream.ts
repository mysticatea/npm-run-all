/**
 * @author Toru Nagashima
 * See LICENSE file in root directory for full license.
 */
import stream from "stream"

/**
 * The writable stream to aggregate data.
 */
export class AggregateStream extends stream.Writable {
    private chunks: Buffer[] = []

    /**
     * The aggregated data.
     */
    public result() {
        return Buffer.concat(this.chunks).toString()
    }

    /**
     * Handle a written data.
     */
    public _write(chunk: Buffer, _encoding: string, callback: Function): void {
        this.chunks.push(chunk)
        callback(null)
    }
}
