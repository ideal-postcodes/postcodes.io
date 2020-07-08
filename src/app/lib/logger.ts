import pino from "pino";

// Pino extreme can lose data but operates at twice the speed. Caveats documented here (https://github.com/pinojs/pino/blob/master/docs/extreme.md)
const { extreme, destination } = pino;

const selectTarget = (file?: string) => {
  if (file === undefined) return destination();
  const output = file.toLowerCase();
  if (output === "stdout") return destination();
  if (output === "perf") return extreme();
  return destination(file);
};

interface Log {
  log: {
    name: string;
    file: string;
  };
}

let logger = pino();

const configure = ({ log }: Log) => {
  const { name, file } = log;
  logger = pino({ name }, selectTarget(file));
  return logger;
};

export {
  /**
   * pino
   *
   * Default logger writes to stdout
   */
  logger,
  /**
   * configure
   *
   * Instantiates a logger and assigns it to exports.logger. Log configuration object accepts:
   */
  configure,
};
