import { AttributeBaseSuite } from "./helper/index";
import {
  Ccg,
  Ced,
  County,
  Constituency,
  District,
  ScottishConstituency,
  Nuts,
  Parish,
  Ward,
  Msoa,
  Lsoa,
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
} from "../api/app/models/index";

const { rigCoreSpecs } = AttributeBaseSuite;

rigCoreSpecs(Ccg);
rigCoreSpecs(Ced);
rigCoreSpecs(County);
rigCoreSpecs(Constituency);
rigCoreSpecs(District);
rigCoreSpecs(ScottishConstituency);
rigCoreSpecs(Nuts);
rigCoreSpecs(Parish);
rigCoreSpecs(Ward);
rigCoreSpecs(Msoa);
rigCoreSpecs(Lsoa);
rigCoreSpecs(PoliceForceArea);
// New models (Nov 2025)
rigCoreSpecs(NhsRegion);
rigCoreSpecs(Ttwa);
rigCoreSpecs(NationalPark);
rigCoreSpecs(Bua);
rigCoreSpecs(Icb);
rigCoreSpecs(CancerAlliance);
rigCoreSpecs(Lsoa21);
rigCoreSpecs(Msoa21);
rigCoreSpecs(Ruc11);
rigCoreSpecs(Ruc21);
rigCoreSpecs(Lep);
