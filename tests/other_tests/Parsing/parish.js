var fs = require("fs");
var csv = require("csv");
var path = require("path");
var source = path.join(__dirname, "parish.txt");
var output = {};

var transform = function (row, index) {
	if (index === 0) {
		return null;
	}
	var newRow = row[0].split("\t")
	output[newRow[0]] = newRow[5];
	return newRow;
}


var stream = csv()
	.from.stream(fs.createReadStream(source))
	.transform(transform)
	.on('data', function (row) {
		console.log(row);
	})
	.on('end', function(count){
	  console.log("Completed check.");
	  fs.writeFileSync(__dirname + "/parish.json", JSON.stringify(output, 2, 2));
	  process.exit(0);
	})
	.on('error', function(error){
	  console.log(error.message);
	  process.exit(0);
	});