#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until nc -z db 5432; do
  sleep 2
done

echo "Database is up. Running import..."
wget -q https://download.geonames.org/export/dump/cities15000.zip
unzip cities15000.zip
node import.js
rm -f cities15000.zip cities15000.txt

echo "Starting API..."
exec node index.js
