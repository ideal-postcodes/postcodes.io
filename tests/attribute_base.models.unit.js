const helper = require("./helper/index.js");

[
  "Ccg",
  "County",
  "Constituency",
  "District",
  "Nuts",
  "Parish",
  "Ward",
].map(name => helper[name])
 .forEach(model => helper.AttributeBaseSuite.rigCoreSpecs(model));

