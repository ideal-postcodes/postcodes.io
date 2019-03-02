"use strict";

/**
 * parseEnv
 *
 * Parses environemnt variable value (`process.env["KEY"]`) returning appropriate type
 *
 * @param VAR {string|undefined}
 * @param defaultValue {string|number|boolean|undefined|null}
 * @returns {string|number|boolean|undefined|null}
 */
const parseEnv = (VAR, defaultValue) => {
  if (VAR === undefined) return defaultValue;
  const n = parseInt(VAR, 10);
  if (!isNaN(n)) return n;
  const lcVar = VAR.toLowerCase();
  if (lcVar === "true") return true;
  if (lcVar === "false") return false;
  if (lcVar === "null") return null;
  return VAR;
};

module.exports = { parseEnv };
