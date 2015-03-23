var fs = require("fs");

var FILE_NAME = "test.txt";

exports.result = function result() {
  try {
    return fs.readFileSync(FILE_NAME, {encoding: "utf8"});
  }
  catch (err) {
    console.error(err.message);
    return null;
  }
}

exports.appendResult = function appendResult(content) {
  fs.appendFileSync(FILE_NAME, content);
}

exports.removeResult = function removeResult() {
  try {
    fs.unlinkSync(FILE_NAME);
  }
  catch (err) {
    // ignore.
  }
}
