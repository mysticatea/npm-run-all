import {spawn} from "child_process";
import {join} from "path";
import minimatch from "minimatch";
import Promise from "./promise";

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
    console.error("ERROR:", err.message);
  }

  return null;
}

//------------------------------------------------------------------------------
const COLON_OR_SLASH = /[:\/]/g;
const CONVERT_MAP = {":": "/", "/": ":"};

function swapColonAndSlash(s) {
  return s.replace(COLON_OR_SLASH, matched => CONVERT_MAP[matched]);
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
    filter.args = args;

    return filter;
  });
  const candidates = taskList.map(swapColonAndSlash);

  // Take tasks while keep the order of patterns.
  const retv = [];
  let matched = Object.create(null);
  filters.forEach(filter => {
    candidates.forEach(task => {
      if (filter(task)) {
        // Merge matched task and arguments.
        const command = swapColonAndSlash(task) + filter.args;

        // Check duplications.
        if (matched[command] !== true) {
          matched[command] = true;
          retv.push(command);
        }
      }
    });
  });

  return retv;
}

//------------------------------------------------------------------------------
function defineExec() {
  if (process.platform === "win32") {
    const FILE = process.env.comspec || "cmd.exe";
    const OPTIONS = {windowsVerbatimArguments: true};
    return command => spawn(FILE, ["/s", "/c", `"${command}"`], OPTIONS);
  }
  else {
    return command => spawn("/bin/sh", ["-c", command]);
  }
}

const exec = defineExec();

function runTask(task, stdin, stdout, stderr) {
  return new Promise((resolve, reject) => {
    // Execute.
    const cp = exec(`npm run-script ${task}`);

    // Piping stdio.
    if (stdin) { stdin.pipe(cp.stdin); }
    if (stdout) { cp.stdout.pipe(stdout); }
    if (stderr) { cp.stderr.pipe(stderr); }

    // Register
    cp.on("exit", code => {
      if (code) {
        reject(new Error(`${task}: None-Zero Exit(${code});`));
      }
      else {
        resolve(null);
      }
    });
    cp.on("error", reject);
  });
}

//------------------------------------------------------------------------------
export default function runAll(_tasks, _options) {
  const patterns = toArray(_tasks);
  if (patterns.length === 0) {
    return Promise.resolve(null);
  }

  const options = _options || {};
  const parallel = Boolean(options.parallel);
  const stdin = options.stdin || null;
  const stdout = options.stdout || null;
  const stderr = options.stderr || null;
  const taskList = options.taskList || readTaskList();

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

  if (parallel) {
    return Promise.all(tasks.map(task => runTask(task, stdin, stdout, stderr)));
  }
  return (function next() {
    const task = tasks.shift();
    return task && runTask(task, stdin, stdout, stderr).then(next);
  })();
}
