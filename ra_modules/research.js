#! /usr/bin/env node 
'use strict';
const winston = require('winston');
const rp = require('request-promise');

async function whatsInterestingHere(coords){
    let query = 'robert+arles';
    let searchUrl = `https://duckduckgo.com/?q=${query}`;
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
            return response;
        })
        .catch(error=>{
            return error;
        });
}

exports.whatsInterestingHere = whatsInterestingHere;
