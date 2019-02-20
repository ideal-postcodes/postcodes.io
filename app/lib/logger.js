"use strict";

const pino = require("pino");

// Pino extreme can lose data but operates at twice the speed. Caveats documented here (https://github.com/pinojs/pino/blob/master/docs/extreme.md)
const { extreme, destination } = pino;

/**
 * pino
 *
 * Default logger writes to stdout
 */
exports.logger = pino();

/**
 * configure
 *
 * Instantiates a logger and assigns it to exports.logger. Log configuration object accepts:
 *
 * @param config.log.name {string}
 * @param config.log.output {string|void} - Determines where to write logs. undefined|"stdout" -> stdout, "file" -> file, "perf" -> extreme
 * @returns {Logger}
 */
exports.configure = ({ log }) => {
  const { name, file } = log;
  const logger = pino({ name }, selectTarget(file));
  exports.logger = logger;
  return logger;
};

const selectTarget = file => {
  if (file === undefined) return destination();
  const output = file.toLowerCase();
  if (output === "stdout") return destination();
  if (output === "perf") return extreme();
  return destination(file);
};
