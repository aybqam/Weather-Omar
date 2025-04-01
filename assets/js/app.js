/**
 * @license MIT
 * @copyright Farouk bouaziz 2025 All rights reserved
 * @author "Farouk bouaziz" <bouzizfarouk3@gmail.com>
 */

'use strict';

import { fetchData, validator, url } from "./api.js";
import * as module from "./module.js";

/**
 * Add event listener on multiple elements.
 * @param {NodeList | Element[]} elements - List of elements.
 * @param {string} eventType - Type of event e.g.`"click"`,`"mouseover"`.
 * @param {(event: Event => void)} callback - Callback function
 */
const addEventOnElements = function (elements, eventType, callback) {
    if (!elements || typeof eventType !== "string" || typeof callback !== "function") {
        console.error("Invalid parameters passed to addEventOnElements:" ,elements, eventType, callback);
        return;
    }
    
    elements.forEach(element => {
        if (!(element instanceof Element)) {
            console.error("Invalid element in elements list:", element);
            return;
        }
        element.addEventListener(eventType, callback);
    }); 
}

const toggleSearch = () => searchView.classList.toggle("header__search--active");

/**
 * Toggle search in mobile devices
*/
const searchView = document.querySelector("[data-search-view]");
const searchTogglers = document.querySelectorAll("[data-search-toggler]");

addEventOnElements(searchTogglers, "click", toggleSearch);

/**
 * SEARCH FEATURE
 */
const searchField = document.querySelector("[data-search-field]");
const searchResult = document.querySelector("[data-search-result]");

let searchTimeout = null;
const searchTimeoutDuration = 500;

searchField.addEventListener("input", function() {
    if (searchTimeout) clearTimeout(searchTimeout);

    const query = searchField.value.trim();
    
    if (query) {
        searchField.classList.add("header__search-field--searching");

        searchTimeout = setTimeout(() => {
            fetchData(url.geo(searchField.value), function (locations) {
                searchField.classList.remove("header__search-field--searching");

                const /** {NodeList} | [] */ items = [];

                if (locations.length) {
                    searchResult.classList.add("header__search-result--active");
                    searchResult.innerHTML = `
                        <ul class="header__search-list" data-search-list></ul>
                    `;
                    const searchList = searchResult.querySelector("[data-search-list]");

                    for (const { name, lat, lon, country, state } of locations) {
                        const searchItem = document.createElement("li");
                        searchItem.classList.add("header__search-item");
    
                        searchItem.innerHTML = `
                            <span class="header__search-item-icon material-icon" aria-hidden="true">location_on</span>
    
                            <div>
                            <p class="header__search-item-title">${name}</p>
    
                                <p class="header__search-item-subtitle label--2">${state || ""} ${country}</p>
                            </div>
    
                            <a href="#/weather?lat=${lat}&lon=${lon}" class="header__search-item-link has-state" aria-label="${name} weather" data-search-toggler></a>
                        `;
    
                        searchList.appendChild(searchItem);
    
                        items.push(searchItem.querySelector("[data-search-toggler]"));
                    } 
                }

                addEventOnElements(items, "click", function () {
                    toggleSearch();
                    searchResult.classList.remove("header__search-result--active");
                    searchResult.innerHTML = "";
                })
            });
        }, searchTimeoutDuration);
    } else {
        searchResult.classList.remove("header__search-result--active");
        searchResult.innerHTML = "";
        searchField.classList.remove("header__search-field--searching");
    }
});



const currentLocationBtn = document.querySelector("[data-current-location-btn]");
const container = document.querySelector("[data-container]");
const currentWeatherSection = document.querySelector("[data-current-weather]");
const dailyForecastSection = document.querySelector("[data-5-day-forecast]");
const highlightsSection = document.querySelector("[data-highlights]");
const hourlyForecastSection = document.querySelector("[data-hourly-forecast]");
const loading = document.querySelector("[data-loading]");
const errorInterface = document.querySelector("[data-error-interface]");


/**
 * Fetch and render all weather data on the webpage
 * @param {number} lat - Latitude coordinate.
 * @param {number} lon - Longitude coordinate.
 */
export const updateWeather = function (lat, lon) {
    loading.style.display = "grid";
    container.style.overflowY = "hidden";
    container.classList.remove("fade-in");
    errorInterface.style.display = "none";


    currentWeatherSection.innerHTML = "";
    highlightsSection.innerHTML = "";
    hourlyForecastSection.innerHTML = "";
    dailyForecastSection.innerHTML = "";

    if (window.location.hash === "#/current-location") {
        currentLocationBtn.setAttribute("disabled", "");
    } else {
        currentLocationBtn.removeAttribute("disabled");
    }

    /**
     * CURRENT WEATHER SECTION
     */
    fetchData(url.currentWeather(lat, lon), function (currentWeather) {

        if (!validator.currentWeather(currentWeather)) {
            console.error("Invalid weather data:", currentWeather);
            return;
        }
        
        const {
            weather: [{ description, icon }], 
            dt: dateUnixUTC,
            sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
            main: { temp, feels_like, pressure, humidity },
            visibility,
            timezone
        } = currentWeather;
        
        const card = document.createElement("div");
        card.classList.add("card", "card--lg", "current-weather__card");

        const formattedDate = module.getFormattedDate(dateUnixUTC, timezone);
        card.innerHTML = `
            <h2 class="current-weather__title section__title title--2">Now</h2>

            <div class="current-weather__temp-wrapper">
                <p class="heading">${parseInt(temp)}&deg;<sup><abbr title="Celsius">c</abbr></sup></p>

                <img 
                src="./assets/images/weather_icons/${icon || "01d"}.png" alt="${description}"
                width="64"
                height="64"
                class="current-weather__icon">
            </div>

            <p class="current-weather__description body--3">${description}</p>

            <ul class="current-weather__meta-list">

                <li class="current-weather__meta-item">
                    <span class="material-icon" aria-hidden="true">calendar_today</span>

                    <time class="current-weather__meta-text title--3" datetime="${formattedDate}">
                        ${formattedDate}
                    </time>
                </li>

                <li class="current-weather__meta-item">
                    <span class="material-icon" aria-hidden="true">location_on</span>

                    <p class="current-weather__meta-text title--3" data-location></p>
                </li>

            </ul>
        `;
        
        fetchData(url.reverseGeo(lat, lon), function(locations) {
            const location = card.querySelector("[data-location]");
            if (locations.length) {
                const { name, country } = locations[0];
                location.innerHTML = `${name}, ${country}`;
            } else {
                location.innerHTML = "Unkown location";
            }
            
        });
        
        currentWeatherSection.appendChild(card);

        /**
         * TODAY'S HIGHLIGHTS
         */
        fetchData(url.airPollution(lat, lon), function(airPollution) {
            if (!validator.airPollution(airPollution)) {
                console.error("Invalid air pollution data:", airPollution);
                return;
            }

            const [{
                main: { aqi },
                components: { no2, o3, so2, pm2_5 }
            }] = airPollution.list;

            const card = document.createElement("div");
            card.classList.add("card", "card--lg");

            const formattedSunriseTime = module.getFormattedTime(sunriseUnixUTC, timezone);
            const formattedSunsetTime = module.getFormattedTime(sunsetUnixUTC, timezone);
            card.innerHTML = `
                <h2 class="highlights__label section__title  title--2" id="highlights-label">Todays Highlights</h2>

                <div class="highlights__list">

                    <div class="highlights-card card card--sm">

                        <h3 class="highlights-card__title title--3">Air Quality Index</h3>

                        <span class="badge badge--aqi-${aqi} highlights-card__label label--${aqi}" 
                        title="${module.aqiText[aqi].message}">
                            ${module.aqiText[aqi].level}
                        </span>

                        <div class="highlights-card__wrapper">

                            <span class="highlights-card__icon material-icon" aria-hidden="true">air</span>

                            <ul class="highlights-card__list card-list">

                                <li class="highlights-card__item highlights-card__item--aqi">
                                    <p class="title--1" aria-label="Air Quality Index value">${pm2_5.toPrecision(3)}</p>

                                    <p class="highlights-card__label label--1">
                                        <abbr title="Particulate Matter 2.5">PM <sub>2.5</sub></abbr>
                                    </p>
                                </li>

                                <li class="highlights-card__item highlights-card__item--aqi">
                                    <p class="title--1" aria-label="Air Quality Index value">${so2.toPrecision(3)}</p>

                                    <p class="highlights-card__label label--1">
                                        <abbr title="Sulfur Dioxide 2">SO <sub>2</sub></abbr>
                                    </p>
                                </li>

                                <li class="highlights-card__item highlights-card__item--aqi">
                                    <p class="title--1" aria-label="Air Quality Index value">${no2.toPrecision(3)}</p>

                                    <p class="highlights-card__label label--1">
                                        <abbr title="Nitrogen Dioxide 2">NO <sub>2</sub></abbr>
                                    </p>
                                </li>

                                <li class="highlights-card__item highlights-card__item--aqi">
                                    <p class="title--1" aria-label="Air Quality Index value">${o3.toPrecision(3)}</p>

                                    <p class="highlights-card__label label--1">
                                        <abbr title="Ozone">O <sub>3</sub></abbr>
                                    </p>
                                </li>

                            </ul>

                        </div>

                    </div>

                    <div class="highlights-card card card--sm">
                        
                        <h3 class="highlights-card__title title--3">Sunrise & Sunset</h3>
                        
                        <div class="highlights-card__list">
                            
                            <div class="highlights-card__item twilight">
                                <span class="highlights-card__icon material-icon" aria-hidden="true">clear_day</span>

                                <div>
                                    <p class="highlights-card__label label--1 twilight__label">Sunrise</p>

                                    <time class="title--1" 
                                    datetime="${formattedSunriseTime}">
                                        ${formattedSunriseTime}
                                    </time>
                                </div>
                            </div>
                            
                            <div class="highlights-card__item twilight">
                                <span class="highlights-card__icon material-icon"
                                aria-hidden="true">clear_night</span>

                                <div>
                                    <p class="highlights-card__label twilight__label label--1">Sunset</p>

                                    <time class="title--1" 
                                    datetime="${formattedSunsetTime}">
                                        ${formattedSunsetTime}
                                    </time>
                                </div>
                            </div>

                        </div>
                        
                    </div>

                    <div class="highlights-card card card--sm">

                        <h3 class="highlights-card__title title--3">Humidity</h3>

                        <div class="highlights-card__wrapper">
                            <span class="highlights-card__icon material-icon" aria-hidden="true">humidity_percentage</span>

                            <p class="title--1">${humidity}<sub>%</sub></p>
                        </div>
                        
                    </div>

                    <div class="highlights-card card card--sm">

                        <h3 class="highlights-card__title title--3">Pressure</h3>

                        <div class="highlights-card__wrapper">
                            <span class="highlights-card__icon material-icon" aria-hidden="true">airwave</span>

                            <p class="title--1">${pressure}<sub>hPa</sub></p>
                        </div>
                        
                    </div>

                    <div class="highlights-card card card--sm">

                        <h3 class="highlights-card__title title--3">Visibility</h3>

                        <div class="highlights-card__wrapper">
                            <span class="highlights-card__icon material-icon" aria-hidden="true">visibility</span>

                            <p class="title--1">${visibility / 1000}<sub>km</sub></p>
                        </div>
                        
                    </div>

                    <div class="highlights-card card card--sm">

                        <h3 class="highlights-card__title title--3">Feel Like</h3>

                        <div class="highlights-card__wrapper">
                            <span class="highlights-card__icon material-icon" aria-hidden="true">thermostat</span>

                            <p class="title--1">${parseInt(feels_like)}&deg;<sup>c</sup></p>
                        </div>
                        
                    </div>

                </div>
            `;

            highlightsSection.appendChild(card);
        });

        /**
         * 24H FORECAST SECTION
         */
        fetchData(url.forecast(lat, lon), function (forecast) {
            if (!validator.forecast(forecast)) {
                console.error("Invalid forecast data:", forecast);
                return;
            }

            const {
                list: forecastList,
                city: { timezone }
            } = forecast;

            hourlyForecastSection.innerHTML = `
                <h2 class="section__title title--2">Today at</h2>

                <div class="hourly-forecast__container">
                    <ul class="hourly-forecast__list" data-temp></ul>

                    <ul class="hourly-forecast__list" data-wind></ul>
                </div>
            `;

            for (const [index, data] of forecastList.entries()) {
                
                if (index > 7) break;

                const {
                    dt: dateTimeUnix,
                    main: { temp },
                    weather,
                    wind: { deg: windDirection, speed: windSpeed }
                } = data;
                const [{ icon, description }] = weather;

                const tempLi = document.createElement("li");
                tempLi.classList.add("hourly-forecast__item");

                tempLi.innerHTML = `
                    <div class="hourly-forecast__card card card--sm">
                                
                        <p class="body--3">${module.getFormattedHour(dateTimeUnix, timezone)}</p>

                        <img 
                        src="./assets/images/weather_icons/${icon}.png" 
                        alt="${description}" 
                        width="48" 
                        height="48" 
                        loading="lazy" 
                        class="hourly-forecast__icon"
                        title="${description}">


                        <p class="body--3">${parseInt(temp)}&deg;</p>

                    </div>
                `;
                hourlyForecastSection.querySelector("[data-temp]").appendChild(tempLi);

                const windLi = document.createElement("li");
                windLi.classList.add("hourly-forecast__item");

                windLi.innerHTML = `
                    <div class="hourly-forecast__card card card--sm">
                                
                        <p class="body--3">${module.getFormattedHour(dateTimeUnix, timezone)}</p>

                        <img 
                        src="./assets/images/weather_icons/direction.png" 
                        alt="direction" 
                        width="48" 
                        height="48" 
                        loading="lazy" 
                        class="hourly-forecast__icon"
                        style="transform: rotate(${windDirection - 180}deg)">


                        <p class="body--3">${parseInt(module.mpsToKmh(windSpeed))} km/h</p>

                    </div>
                `;
                hourlyForecastSection.querySelector("[data-wind]").appendChild(windLi);
            }

            /**
             * 5 DAY FORECAST SECTION
             */
            dailyForecastSection.innerHTML = `
                <h2 class="daily-forecast__label section__title title--2" id="forecast-label">5 Days Forecast</h2>

                <div class="daily-forecast__card card card--lg">
                    <ul data-daily-forecast-list></ul>
                </div>
            `;
            for (let i = 7, len = forecastList.length; i < len; i+= 8) {
                const {
                    main: { temp_max },
                    weather,
                    dt_txt
                } = forecastList[i];
                const [{ icon, description }] = weather;
                const date = new Date(dt_txt);

                const li = document.createElement("li");
                li.classList.add("daily-forecast__item");

                const month = module.monthNames[date.getMonth()];
                const day = module.weekDayNames[date.getDay()];
                li.innerHTML = `
                    <div class="daily-forecast__icon-wrapper">
                        <img 
                            src="./assets/images/weather_icons/${icon}.png" 
                            alt="${description}"
                            width="36"
                            height="36"
                            class="daily-forecast__icon">

                        <p class="daily-forecast__temp title--2" aria-label="Temperature is 25 degrees Celsius">${parseInt(temp_max)}&deg;</p>
                    </div>

                    <time class="daily-forecast__date label--1" 
                    datetime="${date.getDate()} ${month}">
                    ${date.getDate()} ${month}
                    </time>
                    <time class="daily-forecast__date label--1" 
                    datetime=" ${day}">
                    ${day}
                    </time>
                `;
                dailyForecastSection.querySelector("[data-daily-forecast-list]").appendChild(li);

            }

            loading.style.display = "none";
            container.style.overflowY = "overlay";
            container.classList.add("fade-in");
        }); 
    });
}

export const error404 = () => errorInterface.style.display = "flex"; 

import "./route.js";