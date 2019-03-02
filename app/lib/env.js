"use strict";

/**
 * parseEnv
 *
 * Parses environemnt variable value (`process.env["KEY"]`) returning appropriate type
 *
 * @param VAR {string|undefined}
 * @param defaultValue {string|number|boolean|undefined}
 * @returns {string|number|boolean|undefined}
 */
const parseEnv = (VAR, defaultValue) => {
  if (VAR === undefined) return defaultValue;
  const n = parseInt(VAR, 10);
  if (!isNaN(n)) return n;
  if (VAR.toLowerCase() === "true") return true;
  if (VAR.toLowerCase() === "false") return false;
  return VAR;
};

module.exports = { parseEnv };
