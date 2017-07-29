let rp = require('request-promise');
let fs = require('fs');
let os = require('os');
let winston = require('winston');

let weatherConfig = JSON.parse(fs.readFileSync(`${os.homedir()}/.rabot/weatherConfig.json`));
/**
 * 
 * @param {*} location String, "lat,lon" The default of "34.1129745,-117.1628703" is highland, ca
 * @param {*} config Weather service config object
 */
exports.getForecast=getForecast;
async function getForecast(location="34.1129745,-117.1628703", config=weatherConfig){
    try{
        let localizedURL = config.wunderground.apiURL.replace('[LOCATION]', location);
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
        await rp(options)
            .then(response=>{
                requestResp = response;
            })
            .catch(error=>{
                requestResp = error;
            });
        let forecast = requestResp.forecast.simpleforecast.forecastday[1];
        let coords = {latitude:location.split(',')[0],longitude:location.split(',')[1]}
        let locality = await getLocalityByCoords(coords);
        // add locality to forecast
        forecast.city = locality.location.nearby_weather_stations.pws.station[0].city;
        forecast.state = locality.location.nearby_weather_stations.pws.station[0].state;
        forecast.country = locality.location.nearby_weather_stations.pws.station[0].country;
        return(forecast);  
    }catch(e){
        winston.error(`An exception was caught while retrieving the weather.`);
        winston.error(e.message);
        winston.error(e.stack);
        return({error:`An exception was caught while retrieving the weather.`})
    }
}



exports.getLocalityByCoords = getLocalityByCoords
async function getLocalityByCoords(coords, config=weatherConfig){
    try{
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
        await rp(options)
            .then(response=>{
                requestResp = response;
            })
            .catch(error=>{
                requestResp = error;
            });
        return(requestResp);
    }catch(e){
        winston.error(`An exception was caught while getting town/city.`);
        winston.error(e.message);
        winston.error(e.stack);
        throw({message:`slackbot passing on exception: ${e.message}`, stack: e.stack});
    }  
}
