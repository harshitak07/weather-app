
const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "5260a6c6ed59f8abbbb622be5bc2431a"; // Replace with your OpenWeatherMap API key

// Helper function to create weather cards
const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `
        <div>
            <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
            <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
            <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
            <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            <h4>${weatherItem.weather[0].description}</h4>
        </div>
        <div>
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
        </div>`;
    } else {
        return `
    <div class="forecast-card">
        <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
        <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
    </div>`;

    }
};

// Fetch weather details for a city or coordinates
const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL)
        .then(response => response.json())
        .then(data => {
            const uniqueDates = [];
            const filteredData = data.list.filter(item => {
                const date = item.dt_txt.split(" ")[0];
                if (!uniqueDates.includes(date) && uniqueDates.length < 4) {
                    uniqueDates.push(date);
                    return true;
                }
                return false;
            });

            currentWeatherDiv.innerHTML = createWeatherCard(cityName, filteredData[0], 0);
            weatherCardsDiv.innerHTML = filteredData
                .slice(1)
                .map((item, index) => createWeatherCard(cityName, item, index + 1))
                .join("");
        })
        .catch(() => alert("Failed to fetch weather data."));
};

// Fetch city coordinates by name
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) {
        alert("Please enter a city name.");
        return;
    }

    const GEO_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    fetch(GEO_API_URL)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert("City not found.");
                return;
            }
            const { lat, lon, name } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => alert("Failed to fetch city coordinates."));
};

// Fetch user's current location
const getUserCoordinates = () => {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const GEO_API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(GEO_API_URL)
                .then(response => response.json())
                .then(data => {
                    if (data.length === 0) {
                        alert("Unable to retrieve your location.");
                        return;
                    }
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => alert("Failed to fetch location data."));
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Location permission denied.");
            } else {
                alert("Failed to retrieve location.");
            }
        }
    );
};

// Event listeners
searchButton.addEventListener("click", getCityCoordinates);
locationButton.addEventListener("click", getUserCoordinates);
