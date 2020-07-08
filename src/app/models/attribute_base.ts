/**
 * AttributeBase
 *
 * Dynamically defines data models for postcode attributes defined in `/data`
 *
 * Relation name must match source (.json) file name in data/ directory. E.g. /data/<relation>.json
 */

import { query, Schema, Index, generateMethods, Relation } from "./base";

const requiredAttributes: Readonly<Schema> = Object.freeze({
  code: "VARCHAR(32) NOT NULL UNIQUE",
  name: "VARCHAR(255)",
});

const requiredIndex: Readonly<Index> = Object.freeze({
  unique: true,
  column: "code",
});

type SeedData = () => Promise<unknown>;

export interface AttributeRelation extends Partial<Relation> {
  relation: string;
}

export const generateAttributeMethods = (
  relation: AttributeRelation,
  seedMethod?: SeedData
) => {
  const indexes = relation.indexes ? relation.indexes : [];
  indexes.push({ ...requiredIndex });
  const schema = {
    ...(relation.schema || {}),
    ...requiredAttributes,
  };

  const derivedRelation: Relation = {
    relation: relation.relation,
    indexes,
    schema,
  };

  const methods = generateMethods(derivedRelation);
  const seedData = seedMethod ? seedMethod : _seedData(derivedRelation);
  const setupTable = async () => {
    await methods.destroyRelation();
    await methods.createRelation();
    await seedData();
    await methods.createIndexes();
  };

  return {
    ...methods,
    relation,
    seedData,
    setupTable,
  };
};

const _seedData = ({ relation }: Relation) => async () => {
  const data = require(`../../../data/${relation}.json`) as Record<
    string,
    string
  >;
  return Promise.all(
    Object.entries(data).map((values) =>
      query(`INSERT INTO ${relation} (code, name) VALUES ($1, $2)`, values)
    )
  );
};
