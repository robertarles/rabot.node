const express = require('express');
const app = express();
const slackbot = require('./ra_modules/slackbot');
const weatherbot = require('./ra_modules/weatherbot');
const iCloudLocate = require('./ra_modules/iCloudLocate');
const winston = require('winston');

app.get('/api/sendMyForecast/', async function(req, res){
    let myForecast = await weatherbot.getMyForecastMessage();
    let slackbotResponse = await slackbot.send(myForecast.text, myForecast.icon_url);
    myForecast.slackbotResponse = slackbotResponse;
    res.send(myForecast);
});

app.get('/api/getMyForecast/', async function(req, res){
    let myForecast = await weatherbot.getMyForecastMessage();
    res.send(myForecast);
});

app.get('/api/updateMyLocation/', async function(req, res){
    await iCloudLocate.recordLocation('iPhone ra');
    res.send({status: 'location update requested'});
});

app.get('/api/getMyLocation/', async function(req, res){
    let location = iCloudLocate.readDeviceLocationFromFile();
    res.send(location);
});

app.listen(3000, function () {
  winston.log('Example app listening on port 3000!')
});
