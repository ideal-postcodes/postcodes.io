import { isValid } from "postcode";
import { query } from "./db";

export interface ScottishPostcodeRow {
  postcode: string;
  pc_compact: string;
  postcode_district: string;
  postcode_sector: string;
  incode: string;
  outcode: string;
  user_type: string | null;
  date_of_introduction: string | null;
  date_of_deletion: string | null;
  linked_small_user_postcode: string | null;
  longitude: number | null;
  latitude: number | null;
  eastings: number | null;
  northings: number | null;
  split_indicator: string | null;
  grid_link_indicator: string | null;
  grid_link_positional_accuracy: string | null;

  council_area: string | null;
  electoral_ward: string | null;
  registration_district: string | null;
  enterprise_region: string | null;
  strategic_development_planning_area: string | null;
  local_government_district: string | null;
  local_government_district_1991: string | null;
  uk_parliamentary_constituency: string | null;
  scottish_parliamentary_region: string | null;
  scottish_parliamentary_constituency: string | null;
  health_board_area: string | null;
  health_board_area_2006: string | null;
  health_board_area_1995: string | null;
  integration_authority: string | null;
  output_area: string | null;
  output_area_2011: string | null;
  output_area_2001: string | null;
  output_area_1991: string | null;
  data_zone: string | null;
  data_zone_2011: string | null;
  data_zone_2001: string | null;
  intermediate_zone: string | null;
  intermediate_zone_2011: string | null;
  intermediate_zone_2001: string | null;
  locality: string | null;
  locality_2020: string | null;
  locality_2001: string | null;
  locality_1991: string | null;
  settlement: string | null;
  settlement_2020: string | null;
  settlement_2001: string | null;
  civil_parish: string | null;
  island: string | null;
  national_park: string | null;
  travel_to_work_area: string | null;
  lau_level_1: string | null;
  itl_level_2: string | null;
  itl_level_3: string | null;
  urban_rural_6_fold: string | null;
  urban_rural_8_fold: string | null;
  scottish_index_of_multiple_deprivation: number | null;
  roa_community_planning_partnership: string | null;
  roa_local: string | null;
  census_household_count: number | null;
  census_household_count_2011: number | null;
  census_household_count_2001: number | null;
  census_household_count_1991: number | null;
  census_population_count: number | null;
  census_population_count_2011: number | null;
  census_population_count_2001: number | null;
  census_population_count_1991: number | null;
  never_digitised: boolean | null;

  // Codes (selected as separate columns, regrouped by toJson)
  council_area_code: string | null;
  electoral_ward_code: string | null;
  registration_district_code: string | null;
  enterprise_region_code: string | null;
  strategic_development_planning_area_code: string | null;
  local_government_district_code: string | null;
  local_government_district_1991_code: string | null;
  uk_parliamentary_constituency_code: string | null;
  scottish_parliamentary_region_code: string | null;
  scottish_parliamentary_constituency_code: string | null;
  health_board_area_code: string | null;
  health_board_area_2006_code: string | null;
  health_board_area_1995_code: string | null;
  integration_authority_code: string | null;
  data_zone_code: string | null;
  data_zone_2011_code: string | null;
  data_zone_2001_code: string | null;
  intermediate_zone_code: string | null;
  intermediate_zone_2011_code: string | null;
  intermediate_zone_2001_code: string | null;
  locality_code: string | null;
  settlement_code: string | null;
  civil_parish_code: string | null;
  island_code: string | null;
  national_park_code: string | null;
  travel_to_work_area_code: string | null;
  lau_level_1_code: string | null;
  itl_level_2_code: string | null;
  itl_level_3_code: string | null;
  roa_community_planning_partnership_code: string | null;
  roa_local_code: string | null;
}

const SELECT_COLUMNS = `
  postcode, pc_compact, postcode_district, postcode_sector, incode, outcode,
  user_type, date_of_introduction, date_of_deletion, linked_small_user_postcode,
  longitude, latitude,
  grid_reference_easting AS eastings,
  grid_reference_northing AS northings,
  split_indicator, grid_link_indicator, grid_link_positional_accuracy,

  council_area_2019_name AS council_area,
  electoral_ward_2022_name AS electoral_ward,
  registration_district_2007_code AS registration_district,
  enterprise_region_2008_name AS enterprise_region,
  strategic_development_planning_area_2013_code AS strategic_development_planning_area,
  local_government_district_1995_name AS local_government_district,
  local_government_district_1991_name AS local_government_district_1991,
  uk_parliamentary_constituency_2024_name AS uk_parliamentary_constituency,
  scottish_parliamentary_region_2026_name AS scottish_parliamentary_region,
  scottish_parliamentary_constituency_2026_name AS scottish_parliamentary_constituency,
  health_board_area_2019_name AS health_board_area,
  health_board_area_2006_name AS health_board_area_2006,
  health_board_area_1995_name AS health_board_area_1995,
  integration_authority_2019_name AS integration_authority,

  output_area_2022_code AS output_area,
  output_area_2011_code AS output_area_2011,
  output_area_2001_code AS output_area_2001,
  output_area_1991_code AS output_area_1991,
  data_zone_2022_name AS data_zone,
  data_zone_2011_code AS data_zone_2011,
  data_zone_2001_code AS data_zone_2001,
  intermediate_zone_2022_name AS intermediate_zone,
  intermediate_zone_2011_code AS intermediate_zone_2011,
  intermediate_zone_2001_code AS intermediate_zone_2001,
  locality_2022_name AS locality,
  locality_2020_name AS locality_2020,
  locality_2001_name AS locality_2001,
  locality_1991_name AS locality_1991,
  settlement_2022_name AS settlement,
  settlement_2020_name AS settlement_2020,
  settlement_2001_name AS settlement_2001,
  civil_parish_1930_name AS civil_parish,
  island_name AS island,
  national_park_2010_name AS national_park,
  travel_to_work_area_2011_name AS travel_to_work_area,
  lau_2025_level_1_name AS lau_level_1,
  itl_2025_level_2_name AS itl_level_2,
  itl_2025_level_3_name AS itl_level_3,
  urban_rural_6_fold_2022_code AS urban_rural_6_fold,
  urban_rural_8_fold_2022_code AS urban_rural_8_fold,
  scottish_index_of_multiple_deprivation_2020_rank AS scottish_index_of_multiple_deprivation,
  roa_community_planning_partnership_2006_name AS roa_community_planning_partnership,
  roa_local_2006_name AS roa_local,
  census_household_count_2022 AS census_household_count,
  census_household_count_2011,
  census_household_count_2001,
  census_household_count_1991,
  census_population_count_2022 AS census_population_count,
  census_population_count_2011,
  census_population_count_2001,
  census_population_count_1991,
  (never_digitised = 'Y') AS never_digitised,

  council_area_2019_code AS council_area_code,
  electoral_ward_2022_code AS electoral_ward_code,
  registration_district_2007_code AS registration_district_code,
  enterprise_region_2008_code AS enterprise_region_code,
  strategic_development_planning_area_2013_code AS strategic_development_planning_area_code,
  local_government_district_1995_code AS local_government_district_code,
  local_government_district_1991_code AS local_government_district_1991_code,
  uk_parliamentary_constituency_2024_code AS uk_parliamentary_constituency_code,
  scottish_parliamentary_region_2026_code AS scottish_parliamentary_region_code,
  scottish_parliamentary_constituency_2026_code AS scottish_parliamentary_constituency_code,
  health_board_area_2019_code AS health_board_area_code,
  health_board_area_2006_code AS health_board_area_2006_code,
  health_board_area_1995_code AS health_board_area_1995_code,
  integration_authority_2019_code AS integration_authority_code,
  data_zone_2022_code AS data_zone_code,
  data_zone_2011_code AS data_zone_2011_code,
  data_zone_2001_code AS data_zone_2001_code,
  intermediate_zone_2022_code AS intermediate_zone_code,
  intermediate_zone_2011_code AS intermediate_zone_2011_code,
  intermediate_zone_2001_code AS intermediate_zone_2001_code,
  locality_2022_code AS locality_code,
  settlement_2022_code AS settlement_code,
  civil_parish_1930_code AS civil_parish_code,
  island_code AS island_code,
  national_park_2010_code AS national_park_code,
  travel_to_work_area_2011_code AS travel_to_work_area_code,
  lau_2025_level_1_code AS lau_level_1_code,
  itl_2025_level_2_code AS itl_level_2_code,
  itl_2025_level_3_code AS itl_level_3_code,
  roa_community_planning_partnership_2006_code AS roa_community_planning_partnership_code,
  roa_local_2006_code AS roa_local_code
`;

export const find = async (
  postcode: string | null | undefined
): Promise<ScottishPostcodeRow | null> => {
  if (!postcode) return null;
  const trimmed = postcode.trim().toUpperCase();
  if (!isValid(trimmed)) return null;
  const compact = trimmed.replace(/\s/g, "");

  const result = await query<ScottishPostcodeRow>({
    name: "scottish_postcodes_find",
    text: `
      SELECT ${SELECT_COLUMNS}
      FROM public.scottish_postcodes
      WHERE pc_compact = $1
        AND date_of_deletion IS NULL
      LIMIT 1
    `,
    values: [compact],
  });
  return result.rows[0] ?? null;
};

export const toJson = (row: ScottishPostcodeRow) => ({
  postcode: row.postcode,
  pc_compact: row.pc_compact,
  postcode_district: row.postcode_district,
  postcode_sector: row.postcode_sector,
  incode: row.incode,
  outcode: row.outcode,
  user_type: row.user_type,
  date_of_introduction: row.date_of_introduction,
  date_of_deletion: row.date_of_deletion,
  linked_small_user_postcode: row.linked_small_user_postcode,
  longitude: row.longitude,
  latitude: row.latitude,
  eastings: row.eastings,
  northings: row.northings,
  split_indicator: row.split_indicator,
  grid_link_indicator: row.grid_link_indicator,
  grid_link_positional_accuracy: row.grid_link_positional_accuracy,
  council_area: row.council_area,
  electoral_ward: row.electoral_ward,
  registration_district: row.registration_district,
  enterprise_region: row.enterprise_region,
  strategic_development_planning_area: row.strategic_development_planning_area,
  local_government_district: row.local_government_district,
  local_government_district_1991: row.local_government_district_1991,
  uk_parliamentary_constituency: row.uk_parliamentary_constituency,
  scottish_parliamentary_region: row.scottish_parliamentary_region,
  scottish_parliamentary_constituency: row.scottish_parliamentary_constituency,
  health_board_area: row.health_board_area,
  health_board_area_2006: row.health_board_area_2006,
  health_board_area_1995: row.health_board_area_1995,
  integration_authority: row.integration_authority,
  output_area: row.output_area,
  output_area_2011: row.output_area_2011,
  output_area_2001: row.output_area_2001,
  output_area_1991: row.output_area_1991,
  data_zone: row.data_zone,
  data_zone_2011: row.data_zone_2011,
  data_zone_2001: row.data_zone_2001,
  intermediate_zone: row.intermediate_zone,
  intermediate_zone_2011: row.intermediate_zone_2011,
  intermediate_zone_2001: row.intermediate_zone_2001,
  locality: row.locality,
  locality_2020: row.locality_2020,
  locality_2001: row.locality_2001,
  locality_1991: row.locality_1991,
  settlement: row.settlement,
  settlement_2020: row.settlement_2020,
  settlement_2001: row.settlement_2001,
  civil_parish: row.civil_parish,
  island: row.island,
  national_park: row.national_park,
  travel_to_work_area: row.travel_to_work_area,
  lau_level_1: row.lau_level_1,
  itl_level_2: row.itl_level_2,
  itl_level_3: row.itl_level_3,
  urban_rural_6_fold: row.urban_rural_6_fold,
  urban_rural_8_fold: row.urban_rural_8_fold,
  scottish_index_of_multiple_deprivation: row.scottish_index_of_multiple_deprivation,
  roa_community_planning_partnership: row.roa_community_planning_partnership,
  roa_local: row.roa_local,
  census_household_count: row.census_household_count,
  census_household_count_2011: row.census_household_count_2011,
  census_household_count_2001: row.census_household_count_2001,
  census_household_count_1991: row.census_household_count_1991,
  census_population_count: row.census_population_count,
  census_population_count_2011: row.census_population_count_2011,
  census_population_count_2001: row.census_population_count_2001,
  census_population_count_1991: row.census_population_count_1991,
  never_digitised: row.never_digitised,
  codes: {
    council_area: row.council_area_code,
    electoral_ward: row.electoral_ward_code,
    enterprise_region: row.enterprise_region_code,
    local_government_district: row.local_government_district_code,
    local_government_district_1991: row.local_government_district_1991_code,
    uk_parliamentary_constituency: row.uk_parliamentary_constituency_code,
    scottish_parliamentary_region: row.scottish_parliamentary_region_code,
    scottish_parliamentary_constituency: row.scottish_parliamentary_constituency_code,
    health_board_area: row.health_board_area_code,
    health_board_area_2006: row.health_board_area_2006_code,
    health_board_area_1995: row.health_board_area_1995_code,
    integration_authority: row.integration_authority_code,
    data_zone: row.data_zone_code,
    data_zone_2011: row.data_zone_2011_code,
    data_zone_2001: row.data_zone_2001_code,
    intermediate_zone: row.intermediate_zone_code,
    intermediate_zone_2011: row.intermediate_zone_2011_code,
    intermediate_zone_2001: row.intermediate_zone_2001_code,
    locality: row.locality_code,
    settlement: row.settlement_code,
    civil_parish: row.civil_parish_code,
    island: row.island_code,
    national_park: row.national_park_code,
    travel_to_work_area: row.travel_to_work_area_code,
    lau_level_1: row.lau_level_1_code,
    itl_level_2: row.itl_level_2_code,
    itl_level_3: row.itl_level_3_code,
    registration_district: row.registration_district_code,
    strategic_development_planning_area: row.strategic_development_planning_area_code,
    roa_community_planning_partnership: row.roa_community_planning_partnership_code,
    roa_local: row.roa_local_code,
  },
});
