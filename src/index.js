import {join} from "path";
import minimatch from "minimatch";
import Promise from "./promise";
import runTask from "./run-task";

//------------------------------------------------------------------------------
function toArray(x) {
    if (x == null) {
        return [];
    }
    return Array.isArray(x) ? x : [x];
}

//------------------------------------------------------------------------------
function readTaskList() {
    try {
        const packageJsonPath = join(process.cwd(), "package.json");
        const packageJson = require(packageJsonPath);
        const scripts = packageJson && packageJson.scripts;
        if (typeof scripts === "object" && Array.isArray(scripts) === false) {
            return Object.keys(scripts);
        }
    }
    catch (err) {
        console.error("ERROR:", err.message); // eslint-disable-line no-console
    }

    return null;
}

//------------------------------------------------------------------------------
const COLON_OR_SLASH = /[:\/]/g;
const CONVERT_MAP = {":": "/", "/": ":"};

function swapColonAndSlash(s) {
    return s.replace(COLON_OR_SLASH, (matched) => CONVERT_MAP[matched]);
}

function filterTasks(taskList, patterns) {
    // Replace ":" to "/", in order to use as separator in minimatch.
    const filters = patterns.map(pattern => {
        // Separate arguments.
        const trimmed = pattern.trim();
        const spacePos = trimmed.indexOf(" ");
        const task = spacePos < 0 ? trimmed : trimmed.slice(0, spacePos);
        const args = spacePos < 0 ? "" : trimmed.slice(spacePos);
        const filter = minimatch.filter(swapColonAndSlash(task));
        filter.task = task;
        filter.args = args;

        return filter;
    });
    const candidates = taskList.map(swapColonAndSlash);

    const retv = [];
    const matched = Object.create(null);
    function addToRetv(command) {
        if (matched[command] !== true) {
            matched[command] = true;
            retv.push(command);
        }
    }

    // Take tasks while keep the order of patterns.
    filters.forEach(filter => {
        let found = false;

        candidates.forEach(task => {
            if (filter(task)) {
                found = true;
                addToRetv(swapColonAndSlash(task) + filter.args);
            }
        });

        // Built-in tasks should be allowed.
        if (!found && (filter.task === "restart" || filter.task === "env")) {
            addToRetv(filter.task + filter.args);
        }
    });

    return retv;
}

//------------------------------------------------------------------------------
function runAllSequencially(tasks, stdin, stdout, stderr) {
    let currentPromise = null;
    let aborted = false;
    const resultPromise = tasks.reduce((prevPromise, task) => {
        return prevPromise.then(() => {
            if (aborted) {
                return undefined;
            }

            currentPromise = runTask(task, stdin, stdout, stderr);
            return currentPromise.then(item => {
                currentPromise = null;
                if (item.code !== 0 && item.code != null) {
                    throw new Error(
                        `${item.task}: None-Zero Exit(${item.code});`);
                }
            });
        });
    }, Promise.resolve());

    // Define abort method.
    resultPromise.abort = function abort() {
        aborted = true;
        if (currentPromise != null) {
            currentPromise.kill();
        }
    };

    return resultPromise;
}

//------------------------------------------------------------------------------
function runAllInParallel(tasks, stdin, stdout, stderr) {
    // When one of tasks exited with non-zero, kill all tasks.
    // And wait for all tasks exit.
    let nonZeroExited = null;
    const taskPromises = tasks.map(task => runTask(task, stdin, stdout, stderr));
    const parallelPromise = Promise.all(taskPromises.map(p => p.then(item => {
        if (item.code !== 0 && item.code != null) {
            nonZeroExited = nonZeroExited || item;
            taskPromises.forEach(t => { t.kill(); });
        }
    })));
    parallelPromise.catch(() => {
        taskPromises.forEach(t => { t.kill(); });
    });

    // Make fail if there are tasks that exited non-zero.
    const resultPromise = parallelPromise.then(() => {
        if (nonZeroExited != null) {
            throw new Error(
                `${nonZeroExited.task}: None-Zero Exit(${nonZeroExited.code});`);
        }
    });

    // Define abort method.
    resultPromise.abort = function abort() {
        taskPromises.forEach(t => { t.kill(); });
    };

    return resultPromise;
}

//------------------------------------------------------------------------------
export default function runAll(patternOrPatterns, options = {}) {
    const patterns = toArray(patternOrPatterns);
    if (patterns.length === 0) {
        return Promise.resolve(null);
    }

    const {
        parallel = false,
        stdin = null,
        stdout = null,
        stderr = null,
        taskList = readTaskList()
    } = options;

    if (Array.isArray(taskList) === false) {
        return Promise.reject(new Error(
            options.taskList ? `Invalid TaskList: ${options.taskList}` :
            /* else */ `Not Found: ${join(process.cwd(), "package.json")}`));
    }

    const tasks = filterTasks(taskList, patterns);
    if (tasks.length === 0) {
        return Promise.reject(new Error(
            `Matched tasks not found: ${patterns.join(", ")}`));
    }

    return (
        parallel ? runAllInParallel(tasks, stdin, stdout, stderr) :
        /* else */ runAllSequencially(tasks, stdin, stdout, stderr)
    );
}
