let slackbot = require('./ra_modules/slackbot');
let weatherbot = require('./ra_modules/weatherbot');
let iCloudLocate = require('./ra_modules/iCloudLocate');
let winston = require('winston');

main();

async function main(){
    try{
        let currentLocation = await iCloudLocate.getLocation('iPhone ra');
        let forecast = await  weatherbot.getForecast();
        if(forecast.hasOwnProperty('error')){s
            winston.error(`Error reading forecast:\n${forecast.error}`);
            return(1);
        }
        let forecastSummary = `Tomorrow in ${forecast.city}, ${forecast.state}:\nLow:${forecast.low.fahrenheit}\nHigh:${forecast.high.fahrenheit}\nConditions:${forecast.conditions}`;
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

