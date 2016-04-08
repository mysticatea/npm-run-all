"use strict";

function flow() {
    if (arguments.length === 0) {
        return;
    }

    var head = arguments[0];
    var rest = [].slice.call(arguments, 1);

    head();
    setTimeout(function() {
        flow.apply(null, rest);
    }, 33);
}

var text = String(process.argv[2]);
flow(
    function() {
        process.stdout.write(text);
    },
    function() {
        process.stdout.write(text + "\n");
    },
    function() {
        process.stdout.write(text + "\n" + text);
    },
    function() {
        process.stdout.write(text + "\n" + text + "\n");
    },
    function() {
        process.stdout.write(text + "\n" + text + "\n" + text + "\n" + text + "\n");
    },
    function() {
        process.stdout.write("\n" + text + "\n" + text);
    },
    function() {
        process.stdout.write(text + "\n\n\n");
    },
    function() {
        process.stdout.write("\n" + text);
    }
);
