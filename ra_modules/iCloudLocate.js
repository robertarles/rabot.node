'use strict';
const fs = require('fs');
const os = require('os') ;
var icloud = require('find-my-iphone').findmyphone;

const icloudConfFile = `${os.homedir()}/.rabot/icloud.conf`;
const iphoneLocationFile = `${os.homedir()}/.rabot/iphone_ra_location.json`;
icloud.apple_id = '';
icloud.password = '';

exports.loadCredentials = loadCredentials;
function loadCredentials(){
  try {
    let icloudConf = fs.readFileSync(icloudConfFile).toString();
    [icloud.apple_id, icloud.password] = icloudConf.trim().split(',');
  } catch (e) {
    console.error('retrieveCredentials caught exception');
    console.dir(e);
  }
}


exports.getLocation = getLocation
async function getLocation(deviceName){
    var deviceList;
  try{
    if(icloud.apple_id === '' || icloud.password === ''){
        loadCredentials();
    }
    icloud.getDevices(function(error, devices) {
        var device;
        let ourDevicesSample = ['iPhone ra','iPad ra','sinspare-7','ambp','mini','iPhone AA','ambp', 'Andrea\'s iPad', 'Katelyn\'s iPhone', 'Robert’s MacBook Pro'];
        if(error){
            throw({message:error, stack:''});
        }else{
            devices.forEach(saveDeviceLocation(device, deviceName));
        }
    });
  }catch(e){
      console.error(`getLocation caught an error\n\t${e.message}`);
      throw({message: `getLocation caught an error\n\t${e.message}`, stack: e.stack});
  }
  console.log('other');
}


exports.saveDeviceLocation = saveDeviceLocation;
function saveDeviceLocation(device, deviceName){
  try{
    if(device.name.includes(deviceName)){
      fs.writeFileSync(iphoneLocationFile, JSON.stringify(device.location));
    }
  }catch(e){
    console.error('saveDeviceLocation caught exception while iterating devices')
    console.error(e.message);
    console.error(e.stack);
  }
}

//loadCredentials();
//getLocation("iPhone ra");