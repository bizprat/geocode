import fs from 'fs';
import readline from 'readline';
import pkg from 'pg';
import pgFormat from 'pg-format';

const { Pool } = pkg;

const pool = new Pool({
  user: 'geo',
  host: 'localhost',
  database: 'geocode',
  password: 'geo',
  port: 5432,
});

// Path to cities500.txt file
const filePath = './geonames/cities500.txt'; // Update if needed
const minPopulation = 100;

const BATCH_SIZE = 50000;

async function importData() {
  const client = await pool.connect();

  try {
    console.log('Starting import...');

    // Create table with all geonames columns
    await client.query(`
      CREATE TABLE IF NOT EXISTS geonames (
        geonameid INT PRIMARY KEY,
        name TEXT NOT NULL,
        asciiname TEXT NOT NULL,
        alternatenames TEXT,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        feature_class CHAR(1) NOT NULL,
        feature_code TEXT NOT NULL,
        country_code TEXT NOT NULL,
        cc2 TEXT,
        admin1_code TEXT,
        admin2_code TEXT,
        admin3_code TEXT,
        admin4_code TEXT,
        population BIGINT,
        elevation INT,
        dem INT,
        timezone TEXT,
        modification_date DATE,
        geom GEOMETRY(Point, 4326)
      );
    `);

    // Read file line by line
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let totalCount = 0;
    let batch = [];

    // Start a transaction
    await client.query('BEGIN');

    for await (const line of rl) {
      const parts = line.split('\t');
      if (parts.length < 19) {
        console.warn(
          `Skipping line with insufficient columns: ${parts.length}`
        );
        continue;
      }

      // Only keep places (feature_class 'P')
      if (
        parts[6] !== 'P' ||
        parseInt(parts[14]) <= minPopulation
      ) {
        continue;
      }

      // Map each column from the TSV file
      const record = [
        parseInt(parts[0]) || null, // geonameid
        parts[1] || '', // name
        parts[2] || '', // asciiname
        parts[3] || '', // alternatenames
        parseFloat(parts[4]) || 0, // latitude
        parseFloat(parts[5]) || 0, // longitude
        parts[6] || '', // feature_class
        parts[7] || '', // feature_code
        parts[8] || '', // country_code
        parts[9] || '', // cc2
        parts[10] || '', // admin1_code
        parts[11] || '', // admin2_code
        parts[12] || '', // admin3_code
        parts[13] || '', // admin4_code
        parseInt(parts[14]) || 0, // population
        parts[15] ? parseInt(parts[15]) : null, // elevation
        parts[16] ? parseInt(parts[16]) : null, // dem
        parts[17] || '', // timezone
        parts[18] || null, // modification_date
      ];

      batch.push(record);

      // Process batch when it reaches BATCH_SIZE
      if (batch.length >= BATCH_SIZE) {
        await processBatch(client, batch);
        totalCount += batch.length;
        console.log(`Imported ${totalCount} rows...`);
        batch = []; // Reset batch

        // Commit the current transaction and start a new one
        await client.query('COMMIT');
        await client.query('BEGIN');
      }
    }

    // Process any remaining records
    if (batch.length > 0) {
      await processBatch(client, batch);
      totalCount += batch.length;
    }

    // Commit the final transaction
    await client.query('COMMIT');

    // Create indexes to improve query performance
    console.log('Creating indexes...');
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_geonames_asciiname ON geonames (asciiname);'
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_country ON geonames (country_code);'
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_geonames_country_asciiname ON geonames (country_code, asciiname);'
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS idx_geom ON geonames (geom);'
    );

    console.log(
      `✅ Import completed! Total rows inserted: ${totalCount}`
    );
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('❌ Error during import:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

async function processBatch(client, batch) {
  // First, construct a basic insert statement for all columns except geometry
  const insertSql = pgFormat(
    `
    INSERT INTO geonames (
      geonameid, name, asciiname, alternatenames, latitude, longitude, 
      feature_class, feature_code, country_code, cc2, admin1_code, 
      admin2_code, admin3_code, admin4_code, population, elevation, 
      dem, timezone, modification_date
    )
    VALUES %L
    ON CONFLICT (geonameid) DO NOTHING
    RETURNING geonameid;
    `,
    batch
  );

  // Execute the insert
  const result = await client.query(insertSql);

  // If any rows were inserted, update the geometry column
  if (result.rowCount > 0) {
    // Update the geometry column for all inserted rows
    await client.query(`
      UPDATE geonames 
      SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
      WHERE geom IS NULL;
    `);
  }
}

// Run import
importData();
