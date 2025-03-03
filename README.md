# Geocode Project 🌍

Welcome to the Geocode Project! This project allows you to import geonames data into a PostgreSQL database with geospatial capabilities. Follow the instructions below to get started.

## 📥 Getting Started

To download and extract the appropriate geonames database, follow these steps:

1. **Download the geonames databases**:
   - **All Countries**: [Download Link](https://download.geonames.org/export/dump/allCountries.zip)
   - **Cities500**: [Download Link](https://download.geonames.org/export/dump/cities500.zip)

2. **Extract the downloaded files** into the `geonames` folder in your project directory.

## ⚙️ Configuration

1. **Update the `filePath` variable** in `import.js` to point to the extracted files. Make sure the path is correct to avoid any issues during the import process.

2. **Change `minPopulation`** in `import.js` to filter the data that will be dumped into the database. Adjust this value according to your needs.

## 🚀 Running the Application

1. **Start the PostgreSQL database** with geospatial capabilities by running the following command:
   ```bash
   docker-compose up
   ```
   This will start the database as defined in the `docker-compose.yml` file. Note that this file contains the database credentials information.

2. **Install the necessary dependencies** by running:
   ```bash
   npm install
   ```

3. **Dump the data into the database** by executing:
   ```bash
   node import.js
   ```
   Wait for the process to complete. This may take some time depending on the size of the data.

4. **If you want to run the API**, you can execute:
   ```bash
   node index.js
   ```
   However, running the API is not necessary, as you can use the database credentials directly in another project. These credentials can be changed in the `docker-compose.yml` file.

## 🌐 Geocoding and Reverse Geocoding

The Geocode Project provides two main functionalities:

1. **Geocoding**: Convert a city name into geographic coordinates (latitude and longitude). You can use the `/geocode` endpoint to retrieve information about cities based on the provided city name.

2. **Reverse Geocoding**: Convert geographic coordinates back into a city name. The `/reverse` endpoint allows you to input latitude and longitude to get the corresponding city information.

## 📉 Example Requests

### Geocode Request
To get the geocode for a city, you can make a request like this:
```
GET /geocode?city=San Francisco&limit=5
```

### Reverse Geocode Request
To get the city information from latitude and longitude, you can use:
```
GET /reverse?lat=37.7749&lng=-122.4194&limit=5
```

## 🎉 Conclusion

You are now ready to use the Geocode Project! If you have any questions or need further assistance, feel free to reach out.

Happy coding! 💻✨
