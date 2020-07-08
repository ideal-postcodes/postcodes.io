import { Postcode, TerminatedPostcode } from "../../src/app/models/index";
import { assert } from "chai";

// Retrieve object size
const len = (o: unknown[]): number => Object.keys(o).length;

// Dedupes contents of array
const dedupe = (a: unknown[]): unknown[] => Array.from(new Set(a));

/**
 * Returns a function to be passed to an iterator. Checks props exist
 * in object o
 */
const checkProps = (o: any) => (prop: string) => assert.property(o, prop);

/**
 * Returns a function to be passed to an iterator. Checks props
 * do no exist in object o
 */
const checkNotProps = (o: any) => (prop: string) => assert.notProperty(o, prop);

/**
 * Definition of place type
 * public methods should be publicly available
 */
const placeType = {
  public: [
    "code",
    "longitude",
    "latitude",
    "eastings",
    "northings",
    "min_eastings",
    "min_northings",
    "max_eastings",
    "max_northings",
    "local_type",
    "outcode",
    "name_1",
    "name_1_lang",
    "name_2",
    "name_2_lang",
    "county_unitary",
    "county_unitary_type",
    "district_borough",
    "district_borough_type",
    "region",
    "country",
  ],
  private: [
    "id",
    "location",
    "name_1_search",
    "name_1_search_ts",
    "name_2_search",
    "name_2_search_ts",
    "bounding_polygon",
    "polygon",
  ],
};

export const isRawPlaceObject = (o: any) => {
  placeType.public.forEach(checkProps(o));
  placeType.private.forEach(checkProps(o));
};

export const isPlaceObject = (o: any) => {
  placeType.public.forEach(checkProps(o));
  placeType.private.forEach(checkNotProps(o));
};

const outcodeType = {
  private: ["id", "location"],
  public: [
    "eastings",
    "latitude",
    "northings",
    "longitude",
    "admin_ward",
    "admin_county",
    "admin_district",
    "parish",
    "outcode",
    "country",
  ],
};
export const isOutcodeObject = (o: any) => {
  outcodeType.public.forEach(checkProps(o));
  outcodeType.private.forEach(checkNotProps(o));
};

export const isRawOutcodeObject = (o: any) => {
  outcodeType.public.forEach(checkProps(o));
  outcodeType.private.forEach(checkProps(o));
};

//@ts-ignore
const rawPostcodeAttributes = Object.keys(Postcode.relation.schema);
const postcodeAttributes = [
  "nhs_ha",
  "country",
  "quality",
  "postcode",
  "eastings",
  "latitude",
  "northings",
  "longitude",
  "admin_ward",
  "admin_county",
  "admin_district",
  "region",
  "parliamentary_constituency",
  "european_electoral_region",
  "parish",
  "lsoa",
  "msoa",
  "nuts",
  "ccg",
  "primary_care_trust",
  "incode",
  "outcode",
  "codes",
  "ced",
];

//baseObject is the main template of an object
//additionalArr is an array of extra attributes on the postcode object
//blackListedAttr is an array of attributes that Postcode object not supposed to have
export const isObject = (
  o: any,
  requiredAttr: string[],
  additionalAttr: string[] = [],
  blacklist: string[] = []
) => {
  const whitelist = dedupe(requiredAttr.concat(additionalAttr));
  whitelist.forEach(checkProps(o));
  blacklist.forEach(checkNotProps(o));
  assert.equal(len(o), whitelist.length);
};

export const isPostcodeObject = (
  o: any,
  additionalAttr: string[] = [],
  blacklist: string[] = []
) => {
  isObject(o, postcodeAttributes, additionalAttr, blacklist);
};

export const isPostcodeWithDistanceObject = (o: any) =>
  isPostcodeObject(o, ["distance"]);

//raw Object is the one that only has properties specified in the schema
export const isRawPostcodeObject = (
  o: any,
  additionalAttr: string[],
  blacklist: string[]
) => {
  isObject(o, rawPostcodeAttributes, additionalAttr, blacklist);
};

const postcodeForeignColumns = [
  "parliamentary_constituency",
  "admin_district",
  "parish",
  "admin_county",
  "admin_ward",
  "ced",
  "ccg_code",
  "ccg",
  "nuts",
  "nuts_code",
];

export const isRawPostcodeObjectWithFC = (
  o: any,
  additionalAttr: string[],
  blacklist: string[]
) => {
  isRawPostcodeObject(
    o,
    postcodeForeignColumns.concat(additionalAttr || []),
    blacklist
  );
};

export const isRawPostcodeObjectWithFCandDistance = (o: any) =>
  //@ts-ignore
  isRawPostcodeObjectWithFC(o, ["distance"]);

const terminatedPostcodeAttributes = [
  "postcode",
  "year_terminated",
  "month_terminated",
  "longitude",
  "latitude",
];

//@ts-ignore
const rawTerminatedPostcodeAttributes = Object.keys(
  TerminatedPostcode.relation.schema
);

export const isTerminatedPostcodeObject = (o: any) => {
  terminatedPostcodeAttributes.forEach((attr) => assert.property(o, attr));
  assert.equal(Object.keys(o).length, terminatedPostcodeAttributes.length);
};

export const isRawTerminatedPostcodeObject = (o: any) => {
  rawTerminatedPostcodeAttributes.forEach((attr) => assert.property(o, attr));
  assert.equal(Object.keys(o).length, rawTerminatedPostcodeAttributes.length);
};
