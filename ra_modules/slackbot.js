let rp = require('request-promise');
let fs = require('fs');
let os = require('os');
let winston = require('winston');

let slackConfig = JSON.parse(fs.readFileSync(`${os.homedir()}/.rabot/slackConfig.json`));

async function send(text, iconURL, channel='#general', username='rabot.node', webHookUrl=slackConfig.webHookUrl){ 
    try{
        let iconEmoji = ':monkey_face:';
        let msg = {text: text, channel: channel, username: username};
        if(iconURL){
            msg.icon_url= iconURL;
        }else{
            msg.icon_emoji = iconEmoji;
        }
        let requestResp = {};
        var options = {
            method: 'POST',
            url: webHookUrl,
            headers: {
                'User-Agent': 'rabot.node',
                "Content-Type": "application/json",
                "Connection": "keep-alive"
            },
            body: msg,
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
        winston.error(`An exception was caught while sending to Slack.`);
        winston.error(e.message);
        winston.error(e.stack);
        throw({message:`slackbot passing on exception: ${e.message}`, stack: e.stack});
    }  
}
exports.send = send;
