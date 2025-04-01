/**
 * @license MIT
 * @fileoverview All module functions.
 * @copyright Farouk bouaziz 2025 All rights reserved
 * @author "Farouk bouaziz" <bouzizfarouk3@gmail.com>
 */

'use strict';

export const weekDayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

export const monthNames = [
    "Jan",
    "Feb", 
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep", 
    "Oct",
    "Nov",
    "Dec"
];

/**
 * Converts a Unix timestamp and timezone offset to a formatted date string.
 * @param {number} dateUnix - date Unix timestamp in **seconds**
 * @param {number} timezone - Timezone offset from UTC in **seconds**
 * @returns {string} Fromatted date string e.g: `"Sunday 10, Jan"` 
 */
export const getFormattedDate = function(dateUnix, timezone) {
    if (!Number.isFinite(dateUnix) || !Number.isFinite(timezone)) {
        console.error("Invalid dateUnix or timezone:", dateUnix, timezone);
        return "Unavailable";
    }
    
    const date = new Date((dateUnix + timezone) * 1000);
    
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "short"
    });
}

/**
 * Converts a Unix timestamp and timezone offset to a formatted time string.
 * @param {number} timeUnix - time Unix timestamp in **seconds**
 * @param {number} timezone - Timezone offset from UTC in **seconds**
 * @returns {string} Time string, formate: `"HH:MM AM/PM"`
 */
export const getFormattedTime = function(timeUnix, timezone) {
    if (!Number.isFinite(timeUnix) || !Number.isFinite(timezone)) {
        console.error("Invalid timeUnix or timezone:", timeUnix, timezone);
        return "Unavailable";
    }

    const date = new Date((timeUnix + timezone) * 1000);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

/**
 * Converts a Unix timestamp and timezone offset to a formatted hour string.
 * @param {number} timeUnix - time Unix timestamp in **seconds**
 * @param {number} timezone - Timezone offset from UTC in **seconds**
 * @returns {string} Hour string, formate: `"HH AM/PM"`
 */
export const getFormattedHour = function(timeUnix, timezone) {
    if (!Number.isFinite(timeUnix) || !Number.isFinite(timezone)) {
        console.error("Invalid timeUnix or timezone:", timeUnix, timezone);
        return "Unavailable";
    }

    const date = new Date((timeUnix + timezone) * 1000);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: true
    });
}

/**
 * Converts speed from meters per seconds `"m/s"` to kilometers per hour `"km/h"`.
 * @param {number} mps - Speed in meters per second (m/s)
 * @returns {number} Speed in kilometers per hour (km/h)
 */
export const mpsToKmh = mps => mps * 3.6;

export const aqiText = {
    1: {
        level: "Good",
        message: "Air quality is considered satisfactory, and air pollution poses little or no risk."
    },
    2: {
        level: "Fair",
        message: "Air quality is acceptable: however, for some pollutants there may be a moderate health concern for a very small number of people who are unusually sensitive to air pollution."
    },
    3: {
        level: "Moderate",
        message: "Members of sensitive groups may experience health effects. The general public is not likely to be affected."
    },
    4: {
        level: "Poor",
        message: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects"
    },
    5: {
        level: "Very Poor",
        message: "Health warnings of emergancy conditions.The entire population is more likely to be affected"
    }
}