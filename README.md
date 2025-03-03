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
