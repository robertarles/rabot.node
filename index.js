#! /usr/bin/env node 
'use strict;'

const fs = require('fs');
const os = require('os');
const weatherbot = require('./ra_modules/weatherbot');
const iCloudLocate = require('./ra_modules/iCloudLocate');
const raslack = require('raslack');
const research = require('./ra_modules/research')
const winston = require('winston');

let argv = require('minimist')(process.argv.slice(2));

let rabotConfig = JSON.parse(fs.readFileSync(`${os.homedir()}/.rabot/rabotConfig.json`));

if(argv._.includes('locationCheck')){
    locationCheck();
}
if(argv._.includes('weatherCheck')){
    weatherCheck();
}
if(argv._.includes('whatsInterestingHereCheck')){
    whatsInterestingHereCheck();
}


async function locationCheck(){
    // disabled when apple id two factor auth was turned on 2018-09-18T11:07:11+7:00
    //winston.log("Checking location.")
    //let savedDevice;
    //try{
    //    savedDevice = await iCloudLocate.recordLocation('iPhone ra'); // BEWARE: this DOES NOT work synchronously. 
    //}catch(e){
    //    winston.error('Exception caught in main()!');
    //    winston.error(`${e.message}`);
    //    winston.error(`${e.stack}`);
    //    return(1);
    //}
    //console.log('file contents: \n', JSON.parse(fs.readFileSync(`${os.homedir()}/.rabot/iphone_ra_location.json`)));
    //console.log('savedDevice: ', savedDevice);
}

async function whatsInterestingHereCheck(){
    let rabotConfig = JSON.parse(fs.readFileSync(`${os.homedir()}/.rabot/rabotConfig.json`));

    let currentLocation = iCloudLocate.readDeviceLocation(); // BEWARE: this DOES get the OLD recorded location, not from the previous async line
    let interestingLocation = rabotConfig.home.coordinates;
    let currentDistanceFromHome = iCloudLocate.haversine(rabotConfig.home.coordinates, currentLocation);
    if(currentDistanceFromHome > 3){
        interestingLocation = currentLocation;
    }
    let roundedDistanceFromHome = currentDistanceFromHome.toFixed(1);
    let interestingInfo = await research.whatsInterestingHere(interestingLocation);
    let opts = {
        text: `${interestingInfo.place}: ${interestingInfo.text}`,
        username: "rabot.interesting",
        channel: "metarobert.general",
    }
    //let body = raslack.createPostBody(opts);  // fix this. createPost body could be skipped if config is read in post();
    raslack.post(body);
}

async function weatherCheck(){
    winston.log("Checking weather");
    try{
        // await iCloudLocate.recordLocation('iPhone ra'); // all lies. this should now by synchronous
        // let currentLocation = iCloudLocate.readDeviceLocation(); // BEWARE: this DOES get the OLD recorded location, not from the previous async line
        // let currentDistanceFromHome = iCloudLocate.haversine(rabotConfig.home.coordinates, currentLocation);
        // TODO: NO LONGER USING CURRENT LOCATION since turning on two factor aut on my apple ID 2018-09-18T10:49:58+7:00
        let currentDistanceFromHome = 0;
        // get weather for home, unless I've travelled beyond my commute range.
        let weatherLocation = rabotConfig.home.coordinates;
        if(currentDistanceFromHome > Number(rabotConfig.home.max_commute_range)){
            weatherLocation = currentLocation;
        }
        let roundedDistanceFromHome = currentDistanceFromHome.toFixed(1);
        let forecast = await  weatherbot.getForecast(weatherLocation);
        if(forecast.hasOwnProperty('error')){s
            winston.error(`Error reading forecast:\n${forecast.error}`);
            return(1);
        }
        let forecastSummary = `Tomorrow in ${forecast.city}, ${forecast.state} (DstFrHm:${roundedDistanceFromHome}mi)\nLow:${forecast.low.fahrenheit}\tHigh:${forecast.high.fahrenheit}\nConditions:${forecast.conditions}`;
        let opts = {
            text: forecastSummary,
            username: "rabot.weather",
            channel: "metarobert.general",
            icon_url: forecast.icon_url
        }
        //let body = raslack.createPostBody(opts);  // fix this. createPost body could be skipped if config is read in post();
        raslack.post(opts);
    }catch(e){
        winston.error('Exception caught in main()!');
        winston.error(`${e.message}`);
        winston.error(`${e.stack}`);
        return(1);
    }
}

