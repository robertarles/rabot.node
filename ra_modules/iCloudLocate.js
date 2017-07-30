'use strict';
const fs = require('fs');
const os = require('os') ;
const rp = require('request-promise');
var icloud = require('find-my-iphone').findmyphone;

const icloudConfFile = `${os.homedir()}/.rabot/icloudconfig.json`;
const iphoneLocationFile = `${os.homedir()}/.rabot/iphone_ra_location.json`;
icloud.apple_id = '';
icloud.password = '';

exports.loadCredentials = loadCredentials;
function loadCredentials(){
  try {
    let icloudConf = JSON.parse(fs.readFileSync(icloudConfFile).toString());
    icloud.apple_id = icloudConf.apple_id;
    icloud.password = icloudConf.password;
  } catch (e) {
    console.error('retrieveCredentials caught exception');
    console.dir(e);
  }
}


exports.recordLocation = recordLocation
async function recordLocation(deviceName){
  var currentLocation;
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
            devices.forEach(function(device){
              // only save the device (by deviceName) that we specified
              if(device.name.includes(deviceName)){
                currentLocation = device.location;
                saveDeviceLocationToFile(device, deviceName);
              }
            });
        }
    });
  }catch(e){
      console.error(`getLocation caught an error\n\t${e.message}`);
      throw({message: `getLocation caught an error\n\t${e.message}`, stack: e.stack});
  }
}

exports.saveDeviceLocationToFile = saveDeviceLocationToFile;
function saveDeviceLocationToFile(device, deviceName){
  try{
    fs.writeFileSync(iphoneLocationFile, JSON.stringify(device.location));
  }catch(e){
    console.error('saveDeviceLocation caught exception while iterating devices')
    console.error(e.message);
    console.error(e.stack);
  }
}

exports.readDeviceLocation = readDeviceLocation;
function readDeviceLocation(device, deviceName){
  try{
    let deviceLocation = JSON.parse(fs.readFileSync(iphoneLocationFile));
    return(deviceLocation);
  }catch(e){
    console.error('readDeviceLocation caught an exception')
    console.error(e.message);
    console.error(e.stack);
  }
}

exports.haversine = haversine;
function haversine (start, end) {
    // var radii = {
    //   km:    6371,
    //   mile:  3960,
    //   meter: 6371000,
    //   nmi:   3440
    // }
    var R = 3960;  //miles

    var dLat = toRad(end.latitude - start.latitude)
    var dLon = toRad(end.longitude - start.longitude)
    var lat1 = toRad(start.latitude)
    var lat2 = toRad(end.latitude)

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
}

function toRad (num) {
    return num * Math.PI / 180
}