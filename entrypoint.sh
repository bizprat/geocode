#!/bin/sh
set -e

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Define static filename
GEONAMES_ZIP="geonames.zip"
GEONAMES_TXT="geonames.txt"

# Download and extract geonames data
wget -q "$GEONAMES_URL" -O "$GEONAMES_ZIP"
unzip -q "$GEONAMES_ZIP"

# Find the extracted .txt file (assumes only one .txt is extracted)
EXTRACTED_FILE=$(ls | grep -E '\.txt$')

# Rename it to "geonames.txt"
mv "$EXTRACTED_FILE" "$GEONAMES_TXT"

# Run import script
node import.js

# Cleanup
rm -f "$GEONAMES_ZIP" "$GEONAMES_TXT"

# Start API
exec node index.js
