const os = require('os');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const slackbot = require('./ra_modules/slackbot');
const weatherbot = require('./ra_modules/weatherbot');
const iCloudLocate = require('./ra_modules/iCloudLocate');
//const winston = require('winston');

// configure the bodyparser as middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/api/myforecast/deliver', async function(req, res){
    let myForecast = await weatherbot.getMyForecastMessage();
    let slackbotResponse = await slackbot.send(myForecast.text, myForecast.icon_url);
    myForecast.slackbotResponse = slackbotResponse;
    console.log(`myforecast/deliver got ${myForecast.slackbotResponse} slackbot response`);
    res.send(myForecast);
});

app.get('/api/myforecast/', async function(req, res){
    let myForecast = await weatherbot.getMyForecastMessage();
    console.log(myForecast);
    res.send(myForecast);
});

app.get('/api/updateMyLocation/', async function(req, res){
    let deviceName = 'iPhone ra';
    await iCloudLocate.recordLocation(deviceName);
    console.log('location update requested')
    res.send({status: `Location update requested ${deviceName}`});
});

app.get('/api/mylocation/', async function(req, res){
    let location = iCloudLocate.readDeviceLocationFromFile();
    console.log(location);
    res.send(location);
});

app.post('/api/mylocation/', async (req, res)=>{
  const iphoneLocationFile = `${os.homedir()}/.rabot/iphone_ra_location.json`;
  console.log(`recieved location ${JSON.stringify(req.body)}`);
  fs.writeFileSync(iphoneLocationFile, JSON.stringify(req.body));
  res.end(JSON.stringify(req.body));
});

app.listen(port=3000, function () {
    //console.dir(winston);
    console.log(`rabot.node API listening on port ${port}`)
});

