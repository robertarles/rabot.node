'use strict;'
let fs = require('fs');
let os = require('os');
let slackbot = require('./ra_modules/slackbot');
let weatherbot = require('./ra_modules/weatherbot');
let iCloudLocate = require('./ra_modules/iCloudLocate');
let winston = require('winston');

let argv = require('minimist')(process.argv.slice(2));

let rabotConfig = JSON.parse(fs.readFileSync(`${os.homedir()}/.rabot/rabotConfig.json`));

if(argv._.includes('locationCheck')){
    locationCheck();
}
if(argv._.includes('weatherCheck')){
    weatherCheck();
}


async function locationCheck(){
    winston.log("Checking location.")
    try{
        await iCloudLocate.recordLocation('iPhone ra'); // BEWARE: this DOES NOT work synchronously. 
    }catch(e){
        winston.error('Exception caught in main()!');
        winston.error(`${e.message}`);
        winston.error(`${e.stack}`);
        return(1);
    }
    console.log(JSON.parse(fs.readFileSync(`${os.homedir()}/.rabot/iphone_ra_location.json`)));
}

async function weatherCheck(){
    winston.log("Checking weather");
    try{
        await iCloudLocate.recordLocation('iPhone ra'); // all lies. this should now by synchronous
        let currentLocation = iCloudLocate.readDeviceLocation(); // BEWARE: this DOES get the OLD recorded location, not from the previous async line
        let currentDistanceFromHome = iCloudLocate.haversine(rabotConfig.home.coordinates, currentLocation);
        // get weather for home, unles I've travelled beyond my commute range.
        let weatherLocation = rabotConfig.home.coordinates;
        if(currentDistanceFromHome > Number(rabotConfig.home.max_commute_range)){
            weatherLocation = currentLocation;
        }
        let forecast = await  weatherbot.getForecast(weatherLocation);
        if(forecast.hasOwnProperty('error')){s
            winston.error(`Error reading forecast:\n${forecast.error}`);
            return(1);
        }
        let forecastSummary = `Tomorrow in ${forecast.city}, ${forecast.state}:\nDstFrHm:${currentDistanceFromHome}\nLow:${forecast.low.fahrenheit}\tHigh:${forecast.high.fahrenheit}\nConditions:${forecast.conditions}`;
        let iconURL = forecast.icon_url;
        let slackbotResponse = await slackbot.send(`${forecastSummary}`, iconURL);
        if(slackbotResponse!=='ok'){
            throw({message:'Failed to send message?', stack:''});
        }
    }catch(e){
        winston.error('Exception caught in main()!');
        winston.error(`${e.message}`);
        winston.error(`${e.stack}`);
        return(1);
    }
}

