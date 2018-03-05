#! /usr/bin/env node 
'use strict';
const winston = require('winston');
const rp = require('request-promise');
const fs = require('fs');
const os = require('os');

let googleConfig = JSON.parse(fs.readFileSync(`${os.homedir()}/.rabot/google.json`));

async function reverseGeoLookup(coords){
    let address;
    let apiKey = googleConfig.maps.geocodingApiKey;
    let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${apiKey}`;
    var options = {
        method: 'GET',
        url: url,
        headers: {
            'User-Agent': 'rabot.node',
            "Content-Type": "application/json",
            "Connection": "keep-alive"
        },
        json: true
    };
    return await rp(options)
        .then(response=>{
            let retVal = 'not set'
            try {
                for (let result of response.results) {
                    if(result.types.includes('locality')){
                        retVal = result.formatted_address;
                        break;
                    }
                }
            } catch (e){
                retVal = e.message;
            }
            return retVal.split(', USA')[0];
        })
        .catch(error=>{
            return error;
        });
    return address;
}

async function whatsInterestingHere(coords){
    let place = await reverseGeoLookup(coords);
    let searchUrl = `https://api.duckduckgo.com/?q=${place}&format=json&t=rabot.node`;
    var options = {
        method: 'GET',
        url: searchUrl,
        headers: {
            'User-Agent': 'rabot.node',
            "Content-Type": "application/json",
            "Connection": "keep-alive"
        },
        json: true
    };
    return await rp(options)
        .then(response=>{
            return {place: place, text: response.AbstractText};
        })
        .catch(error=>{
            return error;
        });
}

exports.whatsInterestingHere = whatsInterestingHere;
