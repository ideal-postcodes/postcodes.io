"use strict";

/**
 * parseEnv
 *
 * Parses environemnt variable value (`process.env["KEY"]`) returning appropriate type
 */

export type EnVar = string | undefined;

export type EnvDefaultValue = string | number | boolean | undefined | null;

export const parseEnv = (
  VAR: EnVar,
  defaultValue: EnvDefaultValue
): EnvDefaultValue => {
  if (VAR === undefined) return defaultValue;
  const n = parseInt(VAR, 10);
  if (!isNaN(n)) return n;
  const lcVar = VAR.toLowerCase();
  if (lcVar === "true") return true;
  if (lcVar === "false") return false;
  if (lcVar === "null") return null;
  return VAR;
};
