/**
 * @license MIT
 * @fileoverview All api related stuff like api_key, api request etc.
 * @copyright Farouk bouaziz 2025 All rights reserved
 * @author "Farouk bouaziz" <bouzizfarouk3@gmail.com>
 */

'use strict';

const api_key = "f9b3f6ad8f583f540aa4a5d7c880412e";

/**
 * Fetch data from the server with optional retries
 * @param {string} url - The API endpoint URL.
 * @param {Function} callback - A function to handle the fetched data.
 * @param {number} [retries=1] - the number of retry attempts before failing (optional)
 * @param {number} [delay=1000] - the dealy (in ms) between attemps (optional)
 */
export const fetchData = async function(url, callback, retries = 1, delay = 1000) {
    try {
        const res = await fetch(`${url}&appid=${api_key}`);
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        callback(data);
    } catch (error) {
        if (retries > 0) {
            console.warn(`Fetch attempt failed. Retrying in ${delay}ms...`, error);
            setTimeout(() => fetchData(url, callback, retries - 1, delay), delay);
        } else {
            console.error("All fetch attempts failed:", error);
            alert("Couldn't load weather data. Please check your internet connection or try again later.");
        }
    }
}

export const validator = {
    currentWeather(data) {
        return data &&
            typeof data === "object" &&
            Array.isArray(data.weather) &&
            data.weather.length &&
            data.sys && typeof data.sys === "object" &&
            data.main && typeof data.main === "object" &&
            isFinite(data.visibility) &&
            isFinite(data.timezone);
    },
    airPollution(data) {
        const firstItem = data?.list?.[0];  
        return (
            firstItem?.main?.aqi != null && isFinite(firstItem.main.aqi) &&
            firstItem?.components?.no2 != null && isFinite(firstItem.components.no2) &&
            firstItem?.components?.o3 != null && isFinite(firstItem.components.o3) &&
            firstItem?.components?.so2 != null && isFinite(firstItem.components.so2) &&
            firstItem?.components?.pm2_5 != null && isFinite(firstItem.components.pm2_5)
        );
    },
    forecast(data) {
        return (
            data &&
            typeof data === "object" &&
            Array.isArray(data.list) &&
            data.list.length > 0 &&
            data.city &&
            typeof data.city === "object"
        );
    }
}

export const url = {
    currentWeather(lat, lon) {
        return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric`;
    },
    
    forecast(lat, lon) {    
        return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric`;
    },

    airPollution(lat, lon) {    
        return `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}`;
    },

    reverseGeo(lat, lon) {    
        return `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}`;
    },

    /**
     * @param {string} query - City name (e.g: "Paris", "Tokyo").
     * @returns {string} API URL for city geolocation.
     */
    geo(query) {    
        return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`;
        
    }
}