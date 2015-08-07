var fs = require("fs");
var source = process.argv[process.argv.length - 1];
var path = require("path");
var data = JSON.parse(fs.readFileSync(path.join(__dirname, source)));

fs.writeFileSync(path.join(__dirname, "prettify_output.json"), JSON.stringify(data,2,2));
