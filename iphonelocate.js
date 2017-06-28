const fs = require('fs');
const os = require('os') 
var icloud = require("find-my-iphone").findmyphone;

const icloudConfFile = `${os.homedir()}/.rabot/icloud.conf`;
const iphoneLocationFile = `${os.homedir()}/.rabot/location.json`;
icloud.apple_id = "";
icloud.password = "";

exports.retrieveCredentials = ()=>{
    try{
        let icloudConf = fs.readFileSync(icloudConfFile).toString();
        [icloud.apple_id, icloud.password] = icloudConf.trim().split(',');
    }catch(e){
        console.error('retrieveCredentials caught exception');
        console.dir(e);
    }
}


exports.getLocation = (deviceName)=>{
    icloud.getDevices(function(error, devices) {
        var device;
        let ourDevicesSample = ['iPhone ra','iPad ra','sinspare-7','ambp','mini','iPhone AA','ambp', 'Andrea\'s iPad', 'Katelyn\'s iPhone', 'Robert’s MacBook Pro'];
        if(error){
            throw(error);
        }else{
            devices.forEach((device)=>{
                try{
                    if(device.name.includes(deviceName)){
                        exports.writeLocation(device.location);
                    }
                }catch(e){
                    console.error('getLocation caught exception while iterating devices')
                    console.dir(e);
                }
            });
        }
    });
}

exports.writeLocation = (location)=>{
    try{
        fs.writeFileSync(iphoneLocationFile, JSON.stringify(location));
    }catch(e){
        console.error('writeLocation caught exception');
        console.dir(e);
    }

}

exports.retrieveCredentials();
exports.getLocation("iPhone ra");