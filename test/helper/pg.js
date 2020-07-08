/**
 * PG helper methods
 */

const { Base, query } = require("../../src/app/models/index");

// Credit: https://www.peterbe.com/plog/select-all-relations-in-postgresql
const databaseRelationsQuery = `
	SELECT
		c.relname as "Name",
		CASE c.relkind WHEN 'r' THEN 'table'
		WHEN 'v' THEN 'view'
		WHEN 'm' THEN 'materialized view'
		WHEN 'i' THEN 'index'
		WHEN 'S' THEN 'sequence'
		WHEN 's' THEN 'special'
		WHEN 'f' THEN 'foreign table' END as "Type"
	FROM pg_catalog.pg_class c
			 LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
	WHERE c.relkind IN ('r','v','m','S','f','')
				AND n.nspname <> 'pg_catalog'
				AND n.nspname <> 'information_schema'
				AND n.nspname !~ '^pg_toast'
		AND pg_catalog.pg_table_is_visible(c.oid);
`;

/**
 * Lists all relations
 */
const listDatabaseRelations = async () => query(databaseRelationsQuery);

// Credit: https://stackoverflow.com/questions/6777456/list-all-index-names-column-names-and-its-table-name-of-a-postgresql-database
const databaseIndexesQuery = `
	SELECT i.relname as indname,
	       i.relowner as indowner,
	       idx.indrelid::regclass,
	       am.amname as indam,
	       idx.indkey,
	       ARRAY(
	       SELECT pg_get_indexdef(idx.indexrelid, k + 1, true)
	       FROM generate_subscripts(idx.indkey, 1) as k
	       ORDER BY k
	       ) as indkey_names,
	       idx.indexprs IS NOT NULL as indexprs,
	       idx.indpred IS NOT NULL as indpred
	FROM   pg_index as idx
	JOIN   pg_class as i
	ON     i.oid = idx.indexrelid
	JOIN   pg_am as am
	ON     i.relam = am.oid
	JOIN   pg_namespace as ns
	ON     ns.oid = i.relnamespace
	AND    ns.nspname = ANY(current_schemas(false));
`;

// Lists indexes in database
const listDatabaseIndexes = async () => query(databaseIndexesQuery);

module.exports = {
  listDatabaseRelations,
  listDatabaseIndexes,
};
