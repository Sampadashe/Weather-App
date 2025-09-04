const apiKey = "a3a09c589fe3c1b5ca59a2ff9a59e0e1"; // Replace with your OpenWeatherMap API key

const cityInput = document.getElementById("cityInput");
const getWeatherBtn = document.getElementById("getWeatherBtn");
const geoBtn = document.getElementById("geoBtn");

const cityName = document.getElementById("cityName");
const currentDate = document.getElementById("currentDate");
const currentTime = document.getElementById("currentTime");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const condition = document.getElementById("condition");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const uv = document.getElementById("uv");

const fiveDayForecast = document.getElementById("fiveDayForecast");
const hourlyForecast = document.getElementById("hourlyForecast");
const errorMsg = document.getElementById("errorMsg");

getWeatherBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeatherByCity(city);
});

geoBtn.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
    },
    () => {
      showError("Geolocation permission denied.");
    }
  );
});

function showError(msg) {
  errorMsg.textContent = msg;
}

function updateClock() {
  const now = new Date();
  currentDate.textContent = now.toDateString();
  currentTime.textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

async function getWeatherByCity(city) {
  try {
    const geo = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`
    ).then((res) => res.json());
    if (!geo.length) throw new Error("City not found");
    getWeatherByCoords(geo[0].lat, geo[0].lon, geo[0].name);
  } catch (err) {
    showError(err.message);
  }
}

async function getWeatherByCoords(lat, lon, label = "") {
  try {
    const [current, forecast] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      ).then((res) => res.json()),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
      ).then((res) => res.json()),
    ]);

    displayCurrentWeather(current, label || current.name);
    displayForecast(forecast);
    errorMsg.textContent = "";
  } catch (err) {
    showError("Error fetching weather data.");
  }
}

function displayCurrentWeather(data, name) {
  cityName.textContent = name;
  temperature.textContent = `${Math.round(data.main.temp)}°C`;
  feelsLike.textContent = `Feels like: ${Math.round(data.main.feels_like)}°C`;
  condition.textContent = data.weather[0].description;

  const sunRise = new Date(data.sys.sunrise * 1000);
  const sunSet = new Date(data.sys.sunset * 1000);
  sunrise.textContent = `Sunrise: ${sunRise.toLocaleTimeString()}`;
  sunset.textContent = `Sunset: ${sunSet.toLocaleTimeString()}`;

  humidity.textContent = `${data.main.humidity}%`;
  wind.textContent = `${data.wind.speed} km/h`;
  pressure.textContent = `${data.main.pressure} hPa`;
  uv.textContent = "—"; // Optional: replace with UV API if needed
}

function displayForecast(forecast) {
  // 5 Day Forecast (filter every 24h at 12:00)
  const dailyData = forecast.list.filter((item) => item.dt_txt.includes("12:00:00"));
  fiveDayForecast.innerHTML = "";
  dailyData.slice(0, 5).forEach((item) => {
    fiveDayForecast.appendChild(createForecastCard(item));
  });

  // Hourly Forecast (next 6 periods ~18 hrs)
  hourlyForecast.innerHTML = "";
  forecast.list.slice(0, 6).forEach((item) => {
    hourlyForecast.appendChild(createForecastCard(item, true));
  });
}

function createForecastCard(item, isHourly = false) {
  const card = document.createElement("div");
  card.className = "card";

  const date = new Date(item.dt * 1000);
  const timeLabel = isHourly ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toDateString();
  const icon = item.weather[0].icon;
  const temp = `${Math.round(item.main.temp)}°C`;
  const windSpeed = `${item.wind.speed.toFixed(1)} km/h`;

  card.innerHTML = `
    <span>${timeLabel}</span>
    <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${item.weather[0].main}" width="48" height="48">
    <span>${temp}</span>
    <span>${windSpeed}</span>
  `;
  return card;
}
