let cityInput = document.getElementById('city_input'),
    searchBtn = document.getElementById('search_btn'),
    currentWeatherCard = document.querySelectorAll('.weather-left .card')[0],
    sixDaysForecastCard = document.querySelector('.day-forecast'),
    apiCard = document.querySelectorAll('.highlights .card')[0],
    aqiList = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'],
    sunriseCard = document.querySelectorAll('.highlights .card')[1],
    hourlyForecastCard = document.querySelector('.hourly-forecast'), // Added for hourly forecast
    humidityVal = document.getElementById('humidityVal'),
    pressureVal = document.getElementById('pressureVal'),
    visibilityVal = document.getElementById('visibilityVal'),
    windSpeedVal = document.getElementById('windSpeedVal'),
    feelsVal = document.getElementById('feelsVal'),
    themeToggleBtn = document.getElementById('theme-toggle-btn');

const api_Key = "7bfff8480401c47a93c687da39a9e34c";

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
} else {
    document.body.classList.add('light-mode');
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');

    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

function getWeatherDetails(name, lat, lon, country, state) {
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_Key}`,
        WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_Key}`,
        AIR_POLLUTION_API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_Key}`,
        days = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ],
        months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

    fetch(AIR_POLLUTION_API_URL).then(res => res.json()).then(data => {
        let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;
        apiCard.innerHTML = `
             <div class="card-head">
                  <p>Air Quality Index</p>
                  <p class="air-index aqi-${data.list[0].main.aqi}">${aqiList[data.list[0].main.aqi - 1]}</p>
                </div>
                <div class="air-indices">
                  <i class="fa-solid fa-wind" style="font-size: 3rem;"></i>
                  <div class="item">
                    <p>PM2.5</p>
                    <h2>${pm2_5}</h2>
                  </div>
                  <div class="item">
                    <p>PM10</p>
                    <h2>${pm10}</h2>
                  </div>
                  <div class="item">
                    <p>CO</p>
                    <h2>${co}</h2>
                  </div>
                  <div class="item">
                    <p>SO2</p>
                    <h2>${so2}</h2>
                  </div>
                  <div class="item">
                    <p>NO</p>
                    <h2>${no}</h2>
                  </div>
                  <div class="item">
                    <p>NO2</p>
                    <h2>${no2}</h2>
                  </div>
                  <div class="item">
                    <p>NH3</p>
                    <h2>${nh3}</h2>
                  </div>
                  <div class="item">
                    <p>O3</p>
                    <h2>${o3}</h2>
                  </div>
                </div>
        `;
    })

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        if (data.cod !== 200) {
            throw new Error(data.message);
        }

        let date = new Date();
        currentWeatherCard.innerHTML = `
            <div class="current-weather">
                <div class="details">
                    <p>Now</p>
                    <h2>${(data.main.temp - 273.15).toFixed(2)}&deg;C</h2>
                    <p>${data.weather[0].description}</p>
                </div>
                <div class="weather-icon">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
                </div>
            </div>
            <hr>
            <div class="card-footer">
                <p><i class="fa-regular fa-calendar"></i> ${days[date.getDay()]}, ${date.getDate()}, ${months[date.getMonth()]} ${date.getFullYear()}</p>
                <p><i class="fa-solid fa-location-dot"></i> ${name}, ${country}</p>
            </div>
        `;
        let { sunrise, sunset } = data.sys,
            { timezone, visibility } = data,
            { humidity, pressure, feels_like } = data.main,
            { speed } = data.wind,
            sRiseTime = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm A'),
            sSetTime = moment.utc(sunset, 'X').add(timezone, 'seconds').format('hh:mm A');
        sunriseCard.innerHTML = `
                  <div class="crd-head">
                  <p>Sunrise and Sunset</p>
                </div>
                <div class="srise-sset">
                  <div class="item">
                    <div class="icon">
                      <img src="images/sunrise.png" alt="">
                    </div>
                    <div>
                      <p>Sunrise</p>
                      <h2>${sRiseTime}</h2>
                    </div>
                  </div>
                  <div class="item">
                    <div class="icon">
                      <img src="images/sunset.png" alt="">
                    </div>
                    <div>
                      <p>Sunset</p>
                      <h2>${sSetTime}</h2>
                    </div>
                  </div>
                </div>
       `;
        humidityVal.innerHTML = `${humidity}%`;
        pressureVal.innerHTML = `${pressure}hPa`;
        visibilityVal.innerHTML = `${visibility / 1000}km`;
        windSpeedVal.innerHTML = `${speed}m/s`;
        feelsVal.innerHTML = `${(feels_like - 273.15).toFixed(2)}&deg;C`;
    }).catch((error) => {
        alert('Failed to fetch current weather' + error.message);
    });

    fetch(FORECAST_API_URL).then(res => res.json()).then(data => {
        let specificForecastDays = [];
        let sixDaysForecast = data.list.filter(forecast => {
            let forecastDate = new Date(forecast.dt_txt).getDate();
            if (!specificForecastDays.includes(forecastDate)) {
                return specificForecastDays.push(forecastDate);
            }
        });
        sixDaysForecastCard.innerHTML = '';

        for (let i = 1; i < sixDaysForecast.length; i++) {
            let date = new Date(sixDaysForecast[i].dt_txt);
            sixDaysForecastCard.innerHTML += `
             <div class="forecast-thing">
                  <div class="icon-wrapper">
                  <img src="https://openweathermap.org/img/wn/${sixDaysForecast[i].weather[0].icon}.png" alt="">
                  <span>${(sixDaysForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</span>
                  </div>
                  <p>${date.getDate()} ${months[date.getMonth()]}</p>
                  <p>${days[date.getDay()]}</p>
                </div>
            `;
        }

        // Add hourly forecast
        hourlyForecastCard.innerHTML = '';
        let hourlyData = data.list.slice(0, 12); // Show 12 hours of forecast

        hourlyData.forEach(hour => {
            let hourDate = new Date(hour.dt_txt);
            hourlyForecastCard.innerHTML += `
                <div class="hour-card">
                    <p>${hourDate.getHours()}:00</p>
                    <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" alt="">
                    <p>${(hour.main.temp - 273.15).toFixed(2)}&deg;C</p>
                </div>
            `;
        });
    }).catch((error) => {
        alert('Failed to fetch weather forecast' + error.message);
    });
}

function getCityCoordinates() {
    let cityName = cityInput.value.trim();
    cityInput.value = '';

    let API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${api_Key}`;
    fetch(API_URL).then(res => res.json()).then(data => {
        if (data.length === 0) {
            throw new Error('City not found');
        }
        let { lat, lon, name, country, state } = data[0];
        getWeatherDetails(name, lat, lon, country, state);
    }).catch(error => {
        alert('Failed to fetch city coordinates: ' + error.message);
    });
}

searchBtn.addEventListener('click', getCityCoordinates);
