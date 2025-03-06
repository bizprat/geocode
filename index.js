import express from 'express';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT;

// PostgreSQL connection
const pool = new Pool({
  host: 'db',
  port: 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

const maxLimit = 100;

// Autocomplete API
app.get('/geocode', async (req, res) => {
  let { city, limit, country } = req.query;

  if (!city)
    return res.status(400).json({
      error: `Query parameter 'city' is required`,
    });

  if (!limit) limit = 1;

  if (parseInt(limit) > maxLimit)
    return res
      .status(400)
      .json({ error: `Maximum limit is ${maxLimit}` });

  try {
    // Use ILIKE with a wildcard pattern for prefix matching
    const { rows } = await pool.query(
      'SELECT geonameid as id, asciiname as name, alternatenames, latitude, longitude, country_code, population, elevation, dem, timezone FROM geonames WHERE asciiname ILIKE $1 ORDER BY population DESC LIMIT $2',
      [`${city}%`, limit]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reverse Geocode API (Lat/Lng → Cities)
app.get('/reverse', async (req, res) => {
  let { lat, lng, limit } = req.query;
  if (!lat || !lng)
    return res
      .status(400)
      .json({ error: 'Lat/Lng required' });

  if (!limit) limit = 1;

  if (parseInt(limit) > maxLimit)
    return res
      .status(400)
      .json({ error: `Maximum limit is ${maxLimit}` });

  try {
    const { rows } = await pool.query(
      'SELECT geonameid as id, asciiname as name, alternatenames, latitude, longitude, country_code, population, elevation, dem, timezone, ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)) as distance FROM geonames ORDER BY geom <-> ST_SetSRID(ST_MakePoint($1, $2), 4326) LIMIT $3',
      [lng, lat, limit]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Not found' });
    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
