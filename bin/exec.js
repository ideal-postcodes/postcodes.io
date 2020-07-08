const { access, F_OK } = require("fs");
const { resolve } = require("path");

const exec = (path) => {
  access(resolve(__dirname, `${path}.js`), F_OK, (error) => {
    if (error) {
      console.log(`Unable to execute script ${path}`);
      console.log("Remember to compile project with `npm run build`");
      process.exit(1);
    }
    (async function () {
      await require(path).run();
    })();
  });
};

module.exports = exec;
