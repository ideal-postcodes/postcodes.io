import { parallel } from "async";
import {
  Postcode,
  District,
  Parish,
  County,
  Ccg,
  Constituency,
  ScottishConstituency,
  ScottishPostcode,
  Nuts,
  Ward,
  PoliceForceArea,
  Outcode,
  Place,
  TerminatedPostcode,
  Ced,
  Msoa,
  Lsoa,
} from "../app/models/index";

const clear = async () => {
  await Postcode.destroyRelation();
  await TerminatedPostcode.destroyRelation();
  await Place.destroyRelation();
  await ScottishPostcode.destroyRelation();
  await District.destroyRelation();
  await Parish.destroyRelation();
  await Nuts.destroyRelation();
  await County.destroyRelation();
  await Constituency.destroyRelation();
  await ScottishConstituency.destroyRelation();
  await Ccg.destroyRelation();
  await Ward.destroyRelation();
  await PoliceForceArea.destroyRelation();
  await Outcode.destroyRelation();
  await Ced.destroyRelation();
  await Lsoa.destroyRelation();
  await Msoa.destroyRelation();
};

export const run = async (): Promise<void> => {
  if (process.env.PRESERVE_DB !== undefined) return null;
  console.log("Clearing test DB");
  await clear();
  console.log("Done.");
  process.exit(0);
};
