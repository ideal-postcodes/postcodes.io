var	fs = require("fs");
var path = require("path");
var csv = require("csv");
var source = process.argv[process.argv.length - 1]

var dataPath = path.join(__dirname, "../../data/");

var countries = JSON.parse(fs.readFileSync(dataPath + "countries.json"));
var nhsHa = JSON.parse(fs.readFileSync(dataPath + "nhsHa.json"));
var counties = JSON.parse(fs.readFileSync(dataPath + "counties.json"));
var districts = JSON.parse(fs.readFileSync(dataPath + "districts.json"));
var wards = JSON.parse(fs.readFileSync(dataPath + "wards.json"));
var parishes = JSON.parse(fs.readFileSync(dataPath + "parishes.json"));
var constituencies = JSON.parse(fs.readFileSync(dataPath + "constituencies.json"));
var european_registers = JSON.parse(fs.readFileSync(dataPath + "european_registers.json"));
var regions = JSON.parse(fs.readFileSync(dataPath + "regions.json"));
var pcts = JSON.parse(fs.readFileSync(dataPath + "pcts.json"));
var lsoa = JSON.parse(fs.readFileSync(dataPath + "lsoa.json"));
var msoa = JSON.parse(fs.readFileSync(dataPath + "msoa.json"));
var nuts = JSON.parse(fs.readFileSync(dataPath + "nuts.json"));
var ccg = JSON.parse(fs.readFileSync(dataPath + "ccgs.json"));

var missingData = {
	"nhsHa": {},
	"counties": {},
	"districts": {},
	"wards": {},
	"parishes": {},
	"constituencies": {},
	"european_registers": {},
	"regions": {},
	"pcts": {},
	"lsoa": {},
	"msoa": {},
	"nuts": {},
	"ccg": {}
};

var check = function (elem, dataSet, name) {
	if (elem === "") {
		return;
	} else {
		if (dataSet[elem] === undefined) {
			if (!!missingData[name][elem]) {
				missingData[name][elem] = 0;
			} else {
				missingData[name][elem] += 1;
			}
		}
	}
}
			

var transform = function (row, index) {
	// Skip row if terminated
	if (row[4].length !== 0) {
		return null;
	}
	
	// check(row[14], countries);							// Country
	// check(row[12], nhsHa, "nhsHa");								// NHS Health Authority
	// check(row[5], counties, "counties");								// County
	// check(row[6], districts, "districts");								// District
	// check(row[7], wards, "wards");										// Ward
	check(row[44], parishes, "parishes");								// Parish
	// check(row[17], constituencies, "constituencies");					// Westminster const.
	// check(row[18], european_registers, "european_registers");			// European electoral region
	// check(row[15], regions, "regions");								// Region
	// check(row[21], pcts, "pcts");										// Primary Care Trusts
	// check(row[42], lsoa, "lsoa");										// 2011 LSOA
	// check(row[43], msoa, "msoa");										// 2011 MSOA
	// check(row[22], nuts, "nuts");										// NUTS
	// check(row[46], ccg, "ccg");										// Clinical Commissioning Group
}

var stream = csv({delimiter: "	"})
	.from.stream(fs.createReadStream(source))
	.transform(transform)
	.on('end', function(count){
	  console.log("Completed check.");
	  fs.writeFileSync(__dirname + "/output.json", JSON.stringify(missingData, 2, 2));
	  process.exit(0);
	})
	.on('error', function(error){
	  console.log(error.message);
	  process.exit(0);
	});