'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_1 = __importDefault(require("request-promise"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
let winston = require('winston');
let iCloudLocate = require('./iCloudLocate');
let weatherConfig = JSON.parse(fs_1.default.readFileSync(`${os_1.default.homedir()}/.rabot/weatherConfig.json`).toString());
let currentLocation = JSON.parse(fs_1.default.readFileSync(`${os_1.default.homedir()}/.rabot/iphone_ra_location.json`).toString());
let rabotConfig = JSON.parse(fs_1.default.readFileSync(`${os_1.default.homedir()}/.rabot/rabotConfig.json`).toString());
exports.getMyForecastMessage = getMyForecastMessage;
async function getMyForecastMessage() {
    try {
        let currentDistanceFromHome = iCloudLocate.haversine(rabotConfig.home.coordinates, currentLocation);
        // get weather for home, unless I've travelled beyond my commute range.
        let weatherLocation = rabotConfig.home.coordinates;
        if (currentDistanceFromHome > rabotConfig.home.max_commute_range) {
            weatherLocation = currentLocation;
            winston.log(`Setting forecast location to ${currentLocation}`);
        }
        let forecast = await getForecast(weatherLocation);
        if (forecast.hasOwnProperty('error')) {
            winston.error(`Error reading forecast:\n${forecast.error}`);
            return (1);
        }
        let myForecast = {
            text: `Tomorrow in ${forecast.city}, ${forecast.state}:\nLow:${forecast.low.fahrenheit}\tHigh:${forecast.high.fahrenheit}\nConditions:${forecast.conditions}`,
            distance_from_home: currentDistanceFromHome,
            max_commute_range: rabotConfig.home.max_commute_range,
            icon_url: forecast.icon_url
        };
        return (myForecast);
    }
    catch (e) {
        winston.error('Exception caught in getMyForecast()!');
        winston.error(`${e.message}`);
        winston.error(`${e.stack}`);
        return (1);
    }
}
/**
 *
 * @param {*} location String, "lat,lon" The default of "34.1129745,-117.1628703" is highland, ca
 * @param {*} config Weather service config object
 */
exports.getForecast = getForecast;
async function getForecast(location, config = weatherConfig) {
    try {
        let weatherLocation = location;
        if ('latitude' in location) { // did we get a coords object?
            weatherLocation = `${location.latitude},${location.longitude}`;
        }
        let localizedURL = config.wunderground.apiURL.replace('[LOCATION]', weatherLocation);
        let requestResp = {};
        var options = {
            method: 'GET',
            url: localizedURL,
            headers: {
                'User-Agent': 'rabot.node',
                "Content-Type": "application/json",
                "Connection": "keep-alive"
            },
            json: true
        };
        await request_promise_1.default(options)
            .then(response => {
            requestResp = response;
        })
            .catch(error => {
            requestResp = error;
        });
        let forecast = requestResp.forecast.simpleforecast.forecastday[1];
        let coords = { latitude: weatherLocation.split(',')[0], longitude: weatherLocation.split(',')[1] };
        let locality = await getLocalityByCoords(coords);
        // add locality to forecast
        forecast.city = locality.location.nearby_weather_stations.pws.station[0].city;
        forecast.state = locality.location.nearby_weather_stations.pws.station[0].state;
        forecast.country = locality.location.nearby_weather_stations.pws.station[0].country;
        return (forecast);
    }
    catch (e) {
        winston.error(`An exception was caught while retrieving the weather.`);
        winston.error(e.message);
        winston.error(e.stack);
        return ({ error: `An exception was caught while retrieving the weather.` });
    }
}
exports.getLocalityByCoords = getLocalityByCoords;
async function getLocalityByCoords(coords, config = weatherConfig) {
    try {
        let localizedURL = config.wunderground.latLonGeoLookupURL.replace('[LATITUDE]', coords.latitude).replace('[LONGITUDE]', coords.longitude);
        let requestResp = {};
        var options = {
            method: 'GET',
            url: localizedURL,
            headers: {
                'User-Agent': 'rabot.node',
                "Content-Type": "application/json",
                "Connection": "keep-alive"
            },
            json: true
        };
        await request_promise_1.default(options)
            .then(response => {
            requestResp = response;
        })
            .catch(error => {
            requestResp = error;
        });
        return (requestResp);
    }
    catch (e) {
        winston.error(`An exception was caught while getting town/city.`);
        winston.error(e.message);
        winston.error(e.stack);
        throw ({ message: `slackbot passing on exception: ${e.message}`, stack: e.stack });
    }
}
//# sourceMappingURL=weatherbot.js.map