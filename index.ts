#! /usr/bin/env node
import fs from 'fs';
import os from 'os';

let weatherbot = require('./ra_modules/weatherbot');
const iCloudLocate = require('./ra_modules/iCloudLocate');

import slack from 'slack';
import winston from 'winston';

// handle command line arguments
import minimist from 'minimist';
let argv = minimist(process.argv.slice(2))

let rabotConfig = JSON.parse(fs.readFileSync(`${os.homedir()}/.rabot/rabotConfig.json`).toString());

let slackbotToken = process.env.SLACK_BOT_TOKEN

if (argv._.indexOf('weatherCheck') >= 0) {
    weatherCheck();
}
if (argv._.indexOf('chatCommander') >= 0) {
    chatCommander();
}

async function chatCommander() {
    try {
        let channelsResponse = await slack.channels.list({ token: slackbotToken });
        let channelArr: Array<any> = channelsResponse.channels.filter((channel: any) => channel.name_normalized === 'random');
        console.log(channelArr[0].id);
        let channelHistory = await slack.channels.history({ token: slackbotToken, channel: channelArr[0].id });
        console.log(channelHistory);
    } catch (e) {
        console.log(e.message);
        console.log(e.stack);
    }
    return (0);
}

async function weatherCheck() {
    winston.info("Checking weather");
    try {
        // await iCloudLocate.recordLocation('iPhone ra'); // all lies. this should now by synchronous
        let currentLocation: any = iCloudLocate.readDeviceLocation(); // BEWARE: this DOES get the OLD recorded location, not from the previous async line
        // let currentDistanceFromHome = iCloudLocate.haversine(rabotConfig.home.coordinates, currentLocation);
        // TODO: NO LONGER USING CURRENT LOCATION since turning on two factor aut on my apple ID 2018-09-18T10:49:58+7:00
        let currentDistanceFromHome: number = 0;
        // get weather for home, unless I've travelled beyond my commute range.
        let weatherLocation: any = rabotConfig.home.coordinates;
        if (currentDistanceFromHome > Number(rabotConfig.home.max_commute_range)) {
            weatherLocation = currentLocation;
        }
        let roundedDistanceFromHome: string = currentDistanceFromHome.toFixed(1);
        let forecast = await weatherbot.getForecast(weatherLocation);
        if (forecast.hasOwnProperty('error')) {
            winston.error(`Error reading forecast:\n${forecast.error}`);
            return (1);
        }
        let forecastSummary = `TOMORROW in ${forecast.city}, ${forecast.state} (DstFrHm:${roundedDistanceFromHome}mi)\nLow:${forecast.low.fahrenheit}\tHigh:${forecast.high.fahrenheit}\nConditions:${forecast.conditions}`;
        // as_user allows posting to a 1:1 chat (eg @robert), but disallows the icon_url?
        slack.chat.postMessage({ token: slackbotToken, as_user: false, channel: 'C0LJSLHFV', text: forecastSummary, icon_url: forecast.icon_url });
        return (0);
    } catch (e) {
        winston.error('Exception caught in main()!');
        winston.error(`${e.message}`);
        winston.error(`${e.stack}`);
        return (1);
    }
}