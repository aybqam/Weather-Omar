/**
 * @license MIT
 * @fileoverview Manage all routes.
 * @copyright Farouk bouaziz 2025 All rights reserved
 * @author "Farouk bouaziz" <bouzizfarouk3@gmail.com>
 */

'use strict';

import { updateWeather, error404 } from "./app.js";

const defaultLocation = "#/weather?lat=31.5&lon=34.46667" // GAZA

const currentLocation = function () {
    window.navigator.geolocation.getCurrentPosition(res => {
        const { latitude, longitude } = res.coords;

        updateWeather(latitude, longitude);
    }, err => {
        window.location.hash = defaultLocation;
    });
}

/**
 * Searches for city weather based on URL query parameters.
 * @param {string} query - The search query (e.g., "lat=31.5&lon=34.46667").
 */
const searchLocation = query => {
    const parms = new URLSearchParams(query);
    const lat = parms.get("lat");
    const lon = parms.get("lon");

    updateWeather(lat, lon); // e.g -> updateWeather(31.5, 34.46667)
};

const routes = new Map([
    ["/current-location", currentLocation],
    ["/weather", searchLocation]
]);

const checkHash = function () {
    const requestURL = window.location.hash.slice(1);

    const [route, query] = requestURL.includes("?") ? requestURL.split("?") : [requestURL];

    routes.get(route) ? routes.get(route)(query) : error404();
}

window.addEventListener("hashchange", checkHash);

window.addEventListener("load", function() {
    if(!window.location.hash) {
        window.location.hash = "#/current-location";
    } else {
        checkHash();
    }
});