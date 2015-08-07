var name = "lsoa2001"

var transform = function (row, index) {
	if (index === 0) {
		return null;
	}
	var newRow = row[0].split("\t")
	output[newRow[0]] = newRow[1];
	return newRow;
}

var fs = require("fs");
var csv = require("csv");
var path = require("path");
var source = path.join(__dirname, name + ".txt");
var output = {};

var stream = csv()
	.from.stream(fs.createReadStream(source))
	.transform(transform)
	.on('data', function (row) {
		console.log(row);
	})
	.on('end', function(count){
	  console.log("Completed check.");
	  fs.writeFileSync(__dirname + "/"+name+".json", JSON.stringify(output, 2, 2));
	  process.exit(0);
	})
	.on('error', function(error){
	  console.log(error.message);
	  process.exit(0);
	});