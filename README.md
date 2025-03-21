# Geocode Project 🌍

Welcome to the Geocode Project! This project allows you to import geonames data into a PostgreSQL database with geospatial capabilities. Follow the instructions below to get started.

## 📥 Getting Started

Change this config in `.env` file:

1. **GEONAMES_URL**:
   - **All Countries**: https://download.geonames.org/export/dump/allCountries.zip
   - **Cities500**: https://download.geonames.org/export/dump/cities500.zip

2. **MIN_POPULATION**:
   - This will only import cities whose population is greater than the **MIN_POPULATION** filter.

3. **BATCH_SIZE**:
   - Larger batch size makes import faster, may not work with slow server. Lower batch size will import slow, but chances of error are low.

## 🚀 Running the Application
   Crete traefik network in docker if you have not installed traefik docker image (or network not available).
   ```bash
   docker network create traefik
   ```

   ```bash
   docker compose up -d
   ```

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
