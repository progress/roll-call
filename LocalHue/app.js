// David Inglis
// Progress Software - July 2014
// app.js
// A node server within the Progress firewall for communicating with Hues

// *** BEFORE ANY OF THIS WILL WORK: ***
// go to http://developers.meethue.com/gettingstarted.html
// follow the instructions until you've authorized the username
// set whatever username you picked to the variable below
// if you set it to 'newdeveloper' you won't have to change the code
var bridgeUser = 'newdeveloper';

// to set up the above, you needed to find your bridges IP address
// set this variable to your own bridge address
var bridgeIP = '172.21.152.52';

var http = require('http');
var https = require('https');
var express = require('express');
var cron = require('cron');

// number of bulbs talking to the bridge
// 
var nBulbs = 5;

// Array of users tracked by the bulbs
// Change these names if you want different names
// to correspond to the bulbs
var userArray = 
[
{name: "David", status: "out", bulb: "1"},
{name: "Eduardo", status: "out", bulb: "2"},
{name: "Reeti", status: "out", bulb: "3"}
];

// initializes the bulbs 
for(var i = 0; i < userArray.length; i++)
{
    blink(i, 0, 100, 250, 'none', 'none');
}

// Pings the external Node server every 5 seconds 
// Looking to see if user status has changed
var CronJob = cron.CronJob;
new CronJob('*/5 * * * * *', function()
{
    console.log('Checking user status...');
    for(var i = 0; i < userArray.length; i++)
    {
        checkStatus(i);
    }
    
    for(var j = 0; j < nBulbs; j++)
    {
        checkBulb(j);
    }
    
}, null, true);

// checks if the status has changed for a bulb
// if the status has changed, it will blink the bulb to reflect the change
function checkBulb(bulb)
{
    var bulbOptions = 
    {
        host: 'helloworld-20553.onmodulus.net',
        path: '/bulbStatus'
    };

    bulbOptions.path += '?bulb=' + bulb;
    var req = http.get(bulbOptions, function(res)
    {
        var answer = '';
        res.on('data', function(chunk)
        {
            answer += chunk;
            if(answer != 'no') // status has changed
            {
                var obj = JSON.parse(answer);
                blink(bulb, parseInt(obj.hue), parseInt(obj.bri), parseInt(obj.sat), obj.alert, obj.effect);
            }
        });
    });
}
   
// updates various properties of a specified bulbs
function blink(bulb, color, bri, sat, alert, effect)
{
    console.log('bulb number is ' + bulb);
    var options = 
    {
        host: bridgeIP,
        path: '',
        method: 'PUT'
    };

    var body = 
    {
        "hue": color,
        "on": true,
        "bri": bri, // brightness
        "sat": sat, // color saturation
        "alert": alert,
        "effect": effect
    };

    var bodyString = JSON.stringify(body);

    // Philips is silly and doesn't use 0-based indexing
    options.path = '/api/' + bridgeUser + '/lights/' + (bulb + 1) + '/state';
    console.log(options.path);
    // PUT request to the Hue bridge 
	var req = http.request(options, function(res)
    {
    	console.log('request successful');
    	req.on('error', function(e) 
    	{
  			console.log('problem with request: ' + e.message);
		});
	});
	req.write(bodyString);
    console.log('bodystring is ' + bodyString);
	req.end();
    console.log('sent request');
}

// checks the status of a specified user by pinging the external server
function checkStatus(userIndex)
{
    var userStatus =
    {
        host: 'helloworld-20553.onmodulus.net',
        path: '/userStatus'
    }

    var color;
    userStatus.path = '/userStatus?name=' + userArray[userIndex]["name"];

    // GET request to the Modulus server
    var req = http.get(userStatus, function(res)
    {
        var answer = '';
        res.on('data', function(chunk)
        {
            answer += chunk;

            // checks if local user status matches external status
            if(answer != userArray[userIndex]["status"])
            {
                console.log('blinking for index ' + userIndex);
                if(answer == "in")
                {
                    color = 25500; // green
                } 
                else
                {
                    color = 0; // red
                }  
                blink(userIndex, color, 100, 250, "lselect", "none");
                userArray[userIndex].status = answer; // updates local status to match
            }
        });

    });
}
