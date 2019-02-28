"use strict";

const async = require("async");
const { inherits } = require("util");
const { Base } = require("./base");

const requiredAttributes = Object.freeze({
  code: "VARCHAR(32) NOT NULL UNIQUE",
  name: "VARCHAR(255)",
});

/**
 * AttributeBase
 *
 * Dynamically defines data models for postcode attributes defined in `/data`
 *
 * Relation name must match source (.json) file name in data/ directory. E.g. /data/<relation>.json
 *
 * @extends {Base}
 */
function AttributeBase(relation, schema = {}, indexes = []) {
  // Define code and name columns unless specified in by `schema`
  schema = Object.assign({}, requiredAttributes, schema);
  // Create a unique index on code by default
  indexes.push({ unique: true, column: "code" });
  Base.call(this, relation, schema, indexes);
}

inherits(AttributeBase, Base);

AttributeBase.prototype.seedData = function(callback) {
  const data = require(`../../data/${this.relation}.json`);
  const inserts = Object.keys(data)
    .map(code => [code, data[code]])
    .map(values => [
      `INSERT INTO ${this.relation} (code, name) VALUES ($1, $2)`,
      values,
    ])
    .map(([query, values]) => {
      return cb => this._query(query, values, cb);
    });

  async.parallel(inserts, callback);
};

AttributeBase.prototype._setupTable = function(callback) {
  this._destroyRelation(error => {
    if (error) return callback(error);
    this._createRelation(error => {
      if (error) return callback(error);
      this.seedData(error => {
        if (error) return callback(error);
        this.createIndexes(callback);
      });
    });
  });
};
module.exports = AttributeBase;
