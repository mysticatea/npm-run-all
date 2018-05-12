/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */
import fs from "fs-extra"
import babel from "rollup-plugin-babel"
import json from "rollup-plugin-json"
import nodeResolve from "rollup-plugin-node-resolve"
import sourcemaps from "rollup-plugin-sourcemaps"

const { dependencies } = fs.readJSONSync("package.json")

export default {
    experimentalCodeSplitting: true,
    experimentalDynamicImport: true,
    external: Object.keys(dependencies).concat(["path", "readline", "stream"]),

    input: [
        ".temp/bin/npm-run-all.js",
        ".temp/bin/run-s.js",
        ".temp/bin/run-p.js",
        ".temp/lib/index.js",
    ],
    output: {
        dir: "dist",
        format: "cjs",
        sourcemap: true,
        strict: true,
        banner: `/*! @author Toru Nagashima <https://github.com/mysticatea> */\n`,
    },

    plugins: [
        json(),
        nodeResolve(),
        babel({
            babelrc: false,
            plugins: ["@babel/plugin-syntax-dynamic-import"],
            presets: [
                [
                    "@babel/preset-env",
                    {
                        modules: false,
                        targets: {
                            node: "6.5.0",
                        },
                    },
                ],
            ],
        }),
        sourcemaps(),
    ],
}
