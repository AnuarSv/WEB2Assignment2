const axios = require('axios');
const bodyParser = require('body-parser');
const express = require('express');
const app = express()
const port = 3000
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/weather', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

const API_KEY = "YOURAPI";
const GOOGLE_MAPS_API_KEY = "YOURAPI";
const GIPHY_API_KEY = 'YOURAPI';


app.post('/weather', async (req, res) => {
    const city = req.body.city;
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_KEY}`;
        const answer = await axios.get(apiUrl)
        const adviceUrl = 'https://api.adviceslip.com/advice';
        const adviceResponse = await axios.get(adviceUrl);
        const weatherinfo = {
            temp: ((answer.data.main.temp - 32) * 5 / 9).toFixed(),
            description: answer.data.weather[0].description,
            feels_like: ((answer.data.main.feels_like - 32) * 5 / 9).toFixed(),
            humidity: answer.data.main.humidity,
            pressure: answer.data.main.pressure,
            wind_speed: answer.data.wind.speed,
            country_code: answer.data.sys.country,
            lat: answer.data.coord.lat,
            lon: answer.data.coord.lon,
            rain: answer.data.rain ? answer.data.rain['3h'] : 0,
        }
        
        const advice = adviceResponse.data.slip.advice;
        

        const giphyUrl = `https://api.giphy.com/v1/gifs/translate?api_key=${GIPHY_API_KEY}&s=${weatherinfo.description}`;
        const giphyResponse = await axios.get(giphyUrl);
        const gifUrl = giphyResponse.data.data.images.original.url;
        

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Weather App</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
                <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}"></script>
                <script>
                function initMap() {
                    const location = { lat: ${weatherinfo.lat}, lng: ${weatherinfo.lon} };
                    const map = new google.maps.Map(document.getElementById('map'), {
                    center: location,
                    zoom: 10
                    });
                    new google.maps.Marker({ position: location, map: map });
                }
                window.onload = initMap;
                </script>
                <style>
                #map {
                    height: 300px;
                    width: 100%;
                    border-radius: 10px;
                    margin-top: 20px;
                }
                .gif-container {
                    text-align: center;
                    margin-top: 20px;
                }
                .gif-container img {
                    max-width: 100%;
                    border-radius: 10px;
                }
                </style>
            </head>
            <body class="bg-light d-flex flex-column align-items-center min-vh-100 pt-5">
                <div class="card p-4 shadow-sm" style="max-width: 400px; width: 100%;">
                <h1 class="text-center text-primary mb-4">Weather App</h1>
                <form method="post" action="/weather">
                    <div class="mb-3">
                    <input type="text" class="form-control" name="city" placeholder="Enter city" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Get Weather</button>
                </form>
                <div class="mt-4">
                    <h2 class="text-center text-secondary">Weather in ${city}</h2>
                    <div class="text-center">
                    <img src="http://openweathermap.org/img/wn/${answer.data.weather[0].icon}@2x.png" alt="Weather Icon" class="mb-3">
                    </div>
                    <ul class="list-group">
                    <li class="list-group-item">Temperature: <strong>${weatherinfo.temp}°C</strong></li>
                    <li class="list-group-item">Description: <strong>${weatherinfo.description}</strong></li>
                    <li class="list-group-item">Feels Like: <strong>${weatherinfo.feels_like}°C</strong></li>
                    <li class="list-group-item">Humidity: <strong>${weatherinfo.humidity}%</strong></li>
                    <li class="list-group-item">Pressure: <strong>${weatherinfo.pressure} hPa</strong></li>
                    <li class="list-group-item">Wind Speed: <strong>${weatherinfo.wind_speed} mph</strong></li>
                    </ul>
                    <div id="map"></div>
                </div>
                <div class="gif-container">
                    <h4 class="text-secondary">Advice of the Day:</h4>
                    <p>${advice}</p>
                    <img src="${gifUrl}" alt="Relevant GIF">
                </div>
                </div>
            </body>
            </html>
          `);

        //console.log(weatherinfo)
        } catch (error) {
            res.send(`
                <div>
                    <h1>Error</h1>
                    <p>Could not fetch weather data. Please try again.</p>
                    <a href="/weather" class="btn btn-primary">Go back</a>
                </div>
              `);
        console.log(error);
    }

});

app.listen(port, () => console.log(`app listening on port http://localhost:${port}/weather`))