import {spawn} from "child_process";

function toArray(x) {
  if (x == null) {
    return [];
  }
  return Array.isArray(x) ? x : [x];
}

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

function runTask(task, stdout, stderr) {
  return new Promise((resolve, reject) => {
    // Execute.
    const cp = exec(`npm run-script ${task}`);

    // Piping stdio.
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

export default function runAll(_tasks, _options) {
  const tasks = toArray(_tasks);
  if (tasks.length === 0) {
    return Promise.resolve(null);
  }

  const options = _options || {};
  const parallel = Boolean(options.parallel);
  const stdout = options.stdout || null;
  const stderr = options.stderr || null;

  if (parallel) {
    return Promise.all(tasks.map(task => runTask(task, stdout, stderr)));
  }
  return (function next() {
    const task = tasks.shift();
    return task && runTask(task, stdout, stderr).then(next);
  })();
}
