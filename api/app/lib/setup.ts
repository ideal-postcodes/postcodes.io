import {
  Ccg,
  Ced,
  Lsoa,
  Msoa,
  Constituency,
  County,
  District,
  Nuts,
  Parish,
  Ward,
  ScottishConstituency,
  Outcode,
  PoliceForceArea,
  // New models (Nov 2025)
  NhsRegion,
  Ttwa,
  NationalPark,
  Bua,
  Icb,
  CancerAlliance,
  Lsoa21,
  Msoa21,
  Ruc11,
  Ruc21,
  Lep,
} from "../models/index";

// List of support tables generated from data/ directory
export const SUPPORT_TABLES = [
  Ccg,
  Ced,
  Lsoa,
  Msoa,
  Constituency,
  County,
  District,
  Nuts,
  Parish,
  Ward,
  ScottishConstituency,
  PoliceForceArea,
  // New models (Nov 2025)
  NhsRegion,
  Ttwa,
  NationalPark,
  Bua,
  Icb,
  CancerAlliance,
  Lsoa21,
  Msoa21,
  Ruc11,
  Ruc21,
  Lep,
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
