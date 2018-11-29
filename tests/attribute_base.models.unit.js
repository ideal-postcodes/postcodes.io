const helper = require("./helper/index.js");

[
  "Ccg",
  "Ced",
  "County",
  "Constituency",
  "District",
  "Nuts",
  "Parish",
  "Ward",
].map(name => helper[name])
 .forEach(model => helper.AttributeBaseSuite.rigCoreSpecs(model));

