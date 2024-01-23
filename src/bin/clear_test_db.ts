import {
  Postcode,
  ScottishConstituency,
  ScottishPostcode,
  PoliceForceArea,
  Outcode,
  Place,
  TerminatedPostcode,
} from "../app/models/index";

const clear = async () => {
  await Postcode.destroyRelation();
  await TerminatedPostcode.destroyRelation();
  await Place.destroyRelation();
  await ScottishPostcode.destroyRelation();
  await ScottishConstituency.destroyRelation();
  await PoliceForceArea.destroyRelation();
  await Outcode.destroyRelation();
};

export const run = async (): Promise<void> => {
  if (process.env.PRESERVE_DB !== undefined) return null;
  console.log("Clearing test DB");
  await clear();
  console.log("Done.");
  process.exit(0);
};
