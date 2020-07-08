import {
  Ccg,
  Ced,
  Constituency,
  County,
  District,
  Nuts,
  Parish,
  Ward,
  ScottishConstituency,
  Outcode,
} from "../models/index";

// List of support tables generated from data/ directory
export const SUPPORT_TABLES = [
  Ccg,
  Ced,
  Constituency,
  County,
  District,
  Nuts,
  Parish,
  Ward,
  ScottishConstituency,
];

/**
 * Generates support tables in DB
 */
export const setupSupportTables = async (): Promise<void> => {
  for (const table of SUPPORT_TABLES) {
    await table.setupTable();
  }
};

export const setupOutcodeTable = async (): Promise<void> => {
  return Outcode.setupTable();
};
