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
} from "../src/app/models/index";

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
