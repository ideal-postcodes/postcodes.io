"use strict";

const { assert } = require("chai");
const { postcodesioApplication, configFactory } = require("./helper");
const { symbols } = require("pino");

const stream = symbols.streamSym;

describe("Log configuration", () => {
  it("writes to stdout if file not defined", () => {
    const config = configFactory();
    config.log.file = undefined;
    const { pcioLogger } = postcodesioApplication(config);
    const output = pcioLogger[stream];
    assert.equal(output.fd, 1);
  });

  it("writes to file if destination set to file", () => {
    const config = configFactory();
    config.log.file = "/tmp/test.log";
    const { pcioLogger } = postcodesioApplication(config);
    const output = pcioLogger[stream];
    assert.include(output.file, config.log.file);
  });

  it("writes to stdout if log destination set to `stdout`", () => {
    const config = configFactory();
    config.log.file = "stdout";
    const { pcioLogger } = postcodesioApplication(config);
    const output = pcioLogger[stream];
    assert.equal(output.fd, 1);
  });

  // https://github.com/pinojs/pino/blob/master/docs/extreme.md
  it("writes to stdout in high performance mode if file set to perf", () => {
    const config = configFactory();
    config.log.file = "perf";
    const { pcioLogger } = postcodesioApplication(config);
    const output = pcioLogger[stream];
    assert.equal(output.fd, 1);
    assert.isTrue(output.minLength > 0);
  });
});
