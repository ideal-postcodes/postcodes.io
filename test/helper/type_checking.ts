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
  "date_of_introduction",
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
  "pfa",
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
  //@ts-ignore
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
  "id",
  "location",
  "postcode",
  "pc_compact",
  "local_enterprise_partnership",
  "local_enterprise_partnership_2",
  "police_force_area",
  "cancer_alliance",
  "integrated_care_board_id",
  "integrated_care_board",
  "census_lsoa_2021",
  "census_msoa_2021",
  "county",
  "county_electoral_division",
  "ward",
  "parish",
  "health_area",
  "nhs_er",
  "country",
  "region",
  "standard_statistical_region",
  "constituency",
  "european_electoral_region",
  "local_learning",
  "travel_to_work_area",
  "primary_care_trust",
  "international_territorial_level",
  "international_territorial_level_id",
  "statistical_ward_2005",
  "census_area_statistics",
  "national_park",
  "census_lsoa_2001",
  "census_msoa_2001",
  "census_oac_2001_supergroup",
  "census_oac_2001_group",
  "census_oac_2001_subgroup",
  "census_oac_2011_supergroup",
  "census_oac_2011_group",
  "census_oac_2011_subgroup",
  "local_authority",
  "census_lsoa_2011",
  "census_msoa_2011",
  "ccg_id",
  "ccg",
  "built_up_area",
  "built_up_area_subdivision",
  "outcode",
  "postcode_7",
  "postcode_8",
  "postcode_var",
  "date_of_introduction",
  "date_of_termination",
  "county_code",
  "county_electoral_division_code",
  "local_authority_code",
  "ward_code",
  "parish_code",
  "postcode_user",
  "eastings",
  "northings",
  "positional_quality",
  "health_area_code",
  "nhs_er_code",
  "country_code",
  "region_code",
  "standard_statistical_region_code",
  "constituency_code",
  "european_electoral_region_code",
  "local_learning_code",
  "travel_to_work_area_code",
  "primary_care_trust_code",
  "international_territorial_level_code",
  "statistical_ward_2005_code",
  "census_output_area_2001_code",
  "census_area_statistics_code",
  "national_park_code",
  "census_lsoa_2001_code",
  "census_msoa_2001_code",
  "census_urban_rural_indicator_2001_code",
  "census_oac_2001_code",
  "census_oa_2011_code",
  "census_lsoa_2011_code",
  "census_msoa_2011_code",
  "census_wz_2011_code",
  "ccg_code",
  "built_up_area_code",
  "built_up_area_subdivision_code",
  "census_urban_rural_indicator_2011_code",
  "census_oac_2011_code",
  "latitude",
  "longitude",
  "local_enterprise_partnership_code",
  "local_enterprise_partnership_2_code",
  "police_force_area_code",
  "index_of_multiple_deprivation",
  "cancer_alliance_code",
  "integrated_care_board_code",
  "census_oa_2021_code",
  "census_lsoa_2021_code",
  "census_msoa_2021_code",
];

export const isRawPostcodeObjectWithFC = (
  o: any,
  additionalAttr?: string[],
  blacklist?: string[]
) => {
  isRawPostcodeObject(
    o,
    postcodeForeignColumns.concat(additionalAttr || []),
    blacklist || []
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
