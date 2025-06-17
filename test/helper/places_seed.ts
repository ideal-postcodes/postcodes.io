import { Pool } from "pg";
import { config } from "../../api/config/config";

// Direct database insertion for the test place data
export const seedTestPlace = async (): Promise<void> => {
  const testConfig = config.test;
  const pool = new Pool({
    user: testConfig.postgres.user,
    host: testConfig.postgres.host,
    database: testConfig.postgres.database,
    password: testConfig.postgres.password,
    port: testConfig.postgres.port,
  });

  try {
    // Insert the test place directly
    const insertQuery = `
      INSERT INTO places (
        code, name_1, eastings, northings, longitude, latitude, type, local_type, outcode, county_unitary
      ) VALUES (
        'osgb4000000074559490', 'Corston', 331719.836, 1019258.274, -3.1878849, 59.0697789, 'populatedPlace', 'Suburban Area', 'KW17', 'Orkney Islands'
      ) ON CONFLICT (code) DO NOTHING;
    `;
    
    await pool.query(insertQuery);
    console.log("Test place data seeded successfully");
  } catch (error) {
    console.error("Error seeding test place data:", error);
    throw error;
  } finally {
    await pool.end();
  }
};
