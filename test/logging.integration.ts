import { assert } from "chai";
import { postcodesioApplication, configFactory } from "./helper";
import pino from "pino";

// @ts-ignore
const stream = pino.symbols.streamSym;

describe("Log configuration", () => {
  it("writes to stdout if file not defined", () => {
    const config = configFactory();
    config.log.file = undefined;
    // @ts-ignore
    const { pcioLogger } = postcodesioApplication(config);
    const output = pcioLogger[stream];
    assert.equal(output.fd, 1);
  });

  it("writes to file if destination set to file", () => {
    const config = configFactory();
    config.log.file = "/tmp/test.log";
    // @ts-ignore
    const { pcioLogger } = postcodesioApplication(config);
    const output = pcioLogger[stream];
    assert.include(output.file, config.log.file);
  });

  it("writes to stdout if log destination set to `stdout`", () => {
    const config = configFactory();
    config.log.file = "stdout";
    // @ts-ignore
    const { pcioLogger } = postcodesioApplication(config);
    const output = pcioLogger[stream];
    assert.equal(output.fd, 1);
    assert.isTrue(output.sync);
  });

  // https://github.com/pinojs/pino/blob/master/docs/extreme.md
  it("writes to stdout in high performance mode if file set to perf", () => {
    const config = configFactory();
    config.log.file = "perf";
    // @ts-ignore
    const { pcioLogger } = postcodesioApplication(config);
    const output = pcioLogger[stream];
    assert.equal(output.fd, 1);
    assert.isFalse(output.sync);
  });
});
