require("babel/register")({
    ignore: /node_modules|test\-workspace/,
    optional: ["runtime"],
    plugins: ["babel-plugin-espower"]
});
