import {spawn} from "child_process";
import which from "which";
import Promise from "./promise"; // eslint-disable-line no-redeclare

//------------------------------------------------------------------------------
function lookupNpm() {
    const cwd = process.cwd();
    if (lookupNpm.cache[cwd] == null) {
        lookupNpm.cache[cwd] = new Promise((resolve, reject) => {
            which("npm", (err, npmPath) => {
                if (err != null) {
                    reject(err);
                }
                else {
                    resolve(npmPath);
                }
            });
        });
    }
    return lookupNpm.cache[cwd];
}
lookupNpm.cache = Object.create(null);

//------------------------------------------------------------------------------
function isWrapped(s) {
    return (
        (s[0] === "\"" && s[s.length - 1] === "\"") ||
        (s[0] === "'" && s[s.length - 1] === "'")
    );
}

function makeNpmArgs(task) { // eslint-disable-line complexity
    const retv = ["run-script"];

    let start = 0;
    let inSq = false;
    let inDq = false;
    for (let i = 0; i < task.length; ++i) {
        switch (task[i]) {
            case " ":
                if (!inSq && !inDq) {
                    const s = task.slice(start, i).trim();
                    if (s.length > 0) {
                        retv.push(s);
                    }
                    start = i;
                }
                break;

            case "'":
                if (!inDq) {
                    inSq = !inSq;
                }
                break;

            case "\"":
                if (!inSq) {
                    inDq = !inDq;
                }
                break;

            default:
                break;
        }
    }

    const s = task.slice(start).trim();
    if (s.length > 0) {
        retv.push(isWrapped(s) ? s.slice(1, -1) : s);
    }

    return retv;
}

//------------------------------------------------------------------------------
const killTask = (function defineKillTask() {
    if (process.platform === "win32") {
        return function killTask(cp) { // eslint-disable-line no-shadow
            spawn("taskkill", ["/F", "/T", "/PID", cp.pid]);
        };
    }

    function lookupChildren(pid, cb) {
        const cp = spawn("ps", ["--no-headers", "--format", "pid", "--ppid", String(pid)]);
        let children = "";

        cp.stdout.setEncoding("utf8");
        cp.stdout.on("data", (chunk) => {
            children += chunk;
        });

        cp.on("error", cb);
        cp.on("close", () => {
            const list = children.split(/\s+/).filter(x => x);
            cb(list);
        });
    }
    return function killTask(cp) { // eslint-disable-line no-shadow
        // npm does not forward signals to child processes.
        // We must kill those.
        lookupChildren(cp.pid, (shPids) => {
            const shPid = shPids[0];
            if (!shPid) {
                cp.kill();
            }
            else {
                lookupChildren(shPid, (children) => {
                    const args = ["-s", "15"].concat(children, [shPid, cp.pid]);
                    spawn("kill", args);
                });
            }
        });
    };
})();

function detectStreamKind(stream, std) {
    return (
        stream == null ? "ignore" :
        stream !== std ? "pipe" :
        /* else */ stream
    );
}

//------------------------------------------------------------------------------
/**
 * @param {string} task - A task name to run.
 * @param {stream.Readable|null} stdin - A readable stream for stdin of child process.
 * @param {stream.Writable|null} stdout - A writable stream for stdout of child process.
 * @param {stream.Writable|null} stderr - A writable stream for stderr of child process.
 * @returns {Promise}
 *     A promise that becomes fulfilled when task finished.
 *     This promise object has a extra method: `kill()`.
 */
export default function runTask(task, stdin, stdout, stderr) {
    let cp = null;
    const promise = lookupNpm().then(npmPath => {
        return new Promise((resolve, reject) => {
            const stdinKind = detectStreamKind(stdin, process.stdin);
            const stdoutKind = detectStreamKind(stdout, process.stdout);
            const stderrKind = detectStreamKind(stderr, process.stderr);

            // Execute.
            cp = spawn(
                npmPath,
                makeNpmArgs(task),
                {stdio: [stdinKind, stdoutKind, stderrKind]});

            // Piping stdio.
            if (stdinKind === "pipe") { stdin.pipe(cp.stdin); }
            if (stdoutKind === "pipe") { cp.stdout.pipe(stdout); }
            if (stderrKind === "pipe") { cp.stderr.pipe(stderr); }

            // Register
            cp.on("error", (err) => {
                cp = null;
                reject(err);
            });
            cp.on("close", (code) => {
                cp = null;
                resolve({task, code});
            });
        });
    });

    promise.kill = function kill() {
        if (cp != null) {
            killTask(cp);
        }
    };

    return promise;
}
