class WeatherApp {
  constructor() {
    this.weatherElement = document.querySelector(".main__container")
    this.searchBtn = document.querySelector(".search-button")
    this.cityField = document.querySelector(".header-input")
    this.forecastRow = document.querySelector(".forecast__container")
    this.dateElement = document.querySelector(".header__current-date")
    this.geolocateIcons = document.querySelectorAll(".header__geolocate")

    this.localStorageKey = "weatherAppData"
    this.city = ""

    const storedData = localStorage.getItem(this.localStorageKey)
    if (storedData) {
      const { city } = JSON.parse(storedData)
      this.city = city
    }

    this.icons = {
      "01d": "wi-day-sunny",
      "02d": "wi-day-cloudy",
      "03d": "wi-cloud",
      "04d": "wi-cloudy",
      "09d": "wi-showers",
      "10d": "wi-rain",
      "11d": "wi-thunderstorm",
      "13d": "wi-snow",
      "50d": "wi-fog",
      "01n": "wi-night-clear",
      "02n": "wi-night-alt-cloudy",
      "03n": "wi-cloud",
      "04n": "wi-night-cloudy",
      "09n": "wi-night-showers",
      "10n": "wi-night-rain",
      "11n": "wi-night-thunderstorm",
      "13n": "wi-night-alt-snow",
      "50n": "wi-night-fog",
    }
  }

  saveDataToLocalStorage() {
    const data = {
      city: this.city,
    }
    localStorage.setItem(this.localStorageKey, JSON.stringify(data))
  }

  printTodayDate() {
    const today = new Date()
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }

    this.dateElement.insertAdjacentText(
      "beforeend",
      today.toLocaleString("en-us", options)
    )
  }

  getWeekDay(date) {
    const options = { weekday: "long" }
    return date.toLocaleString("en-us", options)
  }

  removeChildren(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild)
    }
  }

  renderForecast(forecast) {
    this.removeChildren(this.forecastRow)
    forecast.forEach((weatherData) => {
      const markup = `<div class="forecast__day">
              <h2 class="forecast__date">${this.getWeekDay(
                new Date(weatherData.dt * 1000)
              )}</h2>
              <i class="wi ${
                this.icons[weatherData.weather[0].icon]
              } forecast__icon"></i>
              <p class="forecast__temp">${Math.floor(
                weatherData.main.temp
              )}°C</p>
              <p class="forecast__desc">${weatherData.weather[0].main}</p>
            </div>`
      this.forecastRow.insertAdjacentHTML("beforeend", markup)
    })
  }

  getForecast(url) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const forecastData = data.list.filter((obj) =>
          obj.dt_txt.endsWith("06:00:00")
        )
        this.renderForecast(forecastData)
        this.saveDataToLocalStorage()
      })
  }

  getCityWeather(url) {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const markup = `<h1 class="weather__location">${data.name}, ${
          data.sys.country
        }</h1>
          <div class="weather__summary summary">
            <p class="summary__weather">
              <i class="wi ${
                this.icons[data.weather[0].icon]
              } weather-icon"></i>
              <span class="weather__celsius-value">${Math.floor(
                data.main.temp - 273,
                15
              )}°C</span>
            </p>
            <p class="summary__sky">${data.weather[0].main}</p>
            <ul class="summary__more-info">
              <li><i class="wi wi-humidity"> Humidity </i><span>${
                data.main.humidity
              }%</span></li>
              <li>
                <i class="wi wi-small-craft-advisory">Wind Speed</i
                ><span>${data.wind.speed} m/s</span>
              </li>
            </ul>
          </div>`
        this.removeChildren(this.weatherElement)
        this.weatherElement.insertAdjacentHTML("beforeend", markup)
        this.city = data.name
        this.saveDataToLocalStorage()
      })
  }

  getWeatherByCoordinates(latitude, longitude) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=f515b52c0e9ad9ab1faf4b7873ec16e4`
    this.getCityWeather(url)
  }

  getForecastByCoordinates(latitude, longitude) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&APPID=35b1f1d45a7b4378cf2430ae601816be&units=metric`
    this.getForecast(`${url}&forecast=true`)
  }

  getWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=f515b52c0e9ad9ab1faf4b7873ec16e4`
    this.getCityWeather(url)
  }

  getForecastByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=35b1f1d45a7b4378cf2430ae601816be&units=metric`
    this.getForecast(`${url}&forecast=true`)
  }

  geosuccess(position) {
    const { latitude, longitude } = position.coords
    this.getWeatherByCoordinates(latitude, longitude)
    this.getForecastByCoordinates(latitude, longitude)
  }

  render() {
    this.searchBtn.addEventListener("click", (e) => {
      e.preventDefault()
      this.getWeatherByCity(this.cityField.value)
      this.getForecastByCity(this.cityField.value)
    })

    this.geolocateIcons.forEach((icon) => {
      icon.addEventListener("click", (e) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(this.geosuccess.bind(this))
        } else {
          alert("Your browser does not support geolocation")
        }
      })
    })
    this.printTodayDate()

    if (this.city) {
      this.getWeatherByCity(this.city)
      this.getForecastByCity(this.city)
    }
  }
}

const weatherApp = new WeatherApp()
weatherApp.render()
