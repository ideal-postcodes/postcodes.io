"use strict";

const { series } = require("async");
const models = require("../models/index");
const { Outcode } = models;

// List of support tables generated from data/ directory
const SUPPORT_TABLES = [
  "Ccg",
  "Ced",
  "Constituency",
  "County",
  "District",
  "Nuts",
  "Parish",
  "Ward",
  "ScottishConstituency",
].map(name => models[name]);

/**
 * Generates support tables in DB
 *
 * @returns {Promise}
 */
const setupSupportTables = () => {
  return new Promise((resolve, reject) => {
    series(SUPPORT_TABLES.map(m => m._setupTable.bind(m)), (error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
  });
};

/**
 * Generates outcodes from existing postcodes relation
 *
 * @returns {Promise}
 */
const setupOutcodeTable = () => {
  return new Promise((resolve, reject) => {
    Outcode._setupTable((error, result) => {
      if (error) return reject(error);
      return resolve(result);
    });
  });
};

module.exports = {
  setupSupportTables,
  setupOutcodeTable,
  SUPPORT_TABLES,
};
