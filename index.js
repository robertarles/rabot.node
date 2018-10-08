#! /usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
let weatherbot = require('./ra_modules/weatherbot');
const iCloudLocate = require('./ra_modules/iCloudLocate');
const slack_1 = __importDefault(require("slack"));
const winston_1 = __importDefault(require("winston"));
// handle command line arguments
const minimist_1 = __importDefault(require("minimist"));
let argv = minimist_1.default(process.argv.slice(2));
let rabotConfig = JSON.parse(fs_1.default.readFileSync(`${os_1.default.homedir()}/.rabot/rabotConfig.json`).toString());
let slackbotToken = process.env.SLACK_BOT_TOKEN;
if (argv._.indexOf('weatherCheck') >= 0) {
    weatherCheck();
}
if (argv._.indexOf('chatCommander') >= 0) {
    chatCommander();
}
async function chatCommander() {
    try {
        let channelsResponse = await slack_1.default.channels.list({ token: slackbotToken });
        let channelArr = channelsResponse.channels.filter((channel) => channel.name_normalized === 'random');
        console.log(channelArr[0].id);
        let channelHistory = await slack_1.default.channels.history({ token: slackbotToken, channel: channelArr[0].id });
        console.log(channelHistory);
    }
    catch (e) {
        console.log(e.message);
        console.log(e.stack);
    }
    return (0);
}
async function weatherCheck() {
    winston_1.default.info("Checking weather");
    try {
        // await iCloudLocate.recordLocation('iPhone ra'); // all lies. this should now by synchronous
        let currentLocation = iCloudLocate.readDeviceLocation(); // BEWARE: this DOES get the OLD recorded location, not from the previous async line
        // let currentDistanceFromHome = iCloudLocate.haversine(rabotConfig.home.coordinates, currentLocation);
        // TODO: NO LONGER USING CURRENT LOCATION since turning on two factor aut on my apple ID 2018-09-18T10:49:58+7:00
        let currentDistanceFromHome = 0;
        // get weather for home, unless I've travelled beyond my commute range.
        let weatherLocation = rabotConfig.home.coordinates;
        if (currentDistanceFromHome > Number(rabotConfig.home.max_commute_range)) {
            weatherLocation = currentLocation;
        }
        let roundedDistanceFromHome = currentDistanceFromHome.toFixed(1);
        let forecast = await weatherbot.getForecast(weatherLocation);
        if (forecast.hasOwnProperty('error')) {
            winston_1.default.error(`Error reading forecast:\n${forecast.error}`);
            return (1);
        }
        let forecastSummary = `TOMORROW in ${forecast.city}, ${forecast.state} (DstFrHm:${roundedDistanceFromHome}mi)\nLow:${forecast.low.fahrenheit}\tHigh:${forecast.high.fahrenheit}\nConditions:${forecast.conditions}`;
        // as_user allows posting to a 1:1 chat (eg @robert), but disallows the icon_url?
        slack_1.default.chat.postMessage({ token: slackbotToken, as_user: false, channel: 'C0LJSLHFV', text: forecastSummary, icon_url: forecast.icon_url });
        return (0);
    }
    catch (e) {
        winston_1.default.error('Exception caught in main()!');
        winston_1.default.error(`${e.message}`);
        winston_1.default.error(`${e.stack}`);
        return (1);
    }
}
//# sourceMappingURL=index.js.map