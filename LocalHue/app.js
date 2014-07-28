// David Inglis
// Progress Software - July 2014
// app.js
// A node server within the Progress firewall for communicating with Hues

var http = require('http');
var express = require('express');
var cron = require('cron');

var checkActivity =
{
	host: 'helloworld-20553.onmodulus.net',
	path: '/newActivity'
};


// Array of users tracked by the bulbs
var userArray = 
[
{name: "David", status: "out", bulb: "1"},
{name: "Eduardo", status: "out", bulb: "2"},
{name: "Reeti", status: "out", bulb: "3"}
];

for(var i = 0; i < userArray.length; i++)
{
    blink(i, 0);
}

/*
var app = express();
app.set('port', process.env.PORT || 3000);


// Initializes http server
var server = http.createServer(app);
server.listen(app.get('port'), function()
{
	console.log('server listening on  ' + app.get('port'));	
});
*/

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
}, null, true);
   
// sets a bulb to a color then blinks it 15 times
function blink(bulb, color)
{
    var options = 
    {
        host: '172.21.152.109',
        path: '/api/newdeveloper/lights/2/state',
        method: 'PUT'
    };

    var body = 
    {
        "hue": color,
        "on": true,
        "bri": 100, // brightness
        "sat": 250, // color saturation
        "alert": "lselect" // this is the Hue's blink syntax
    };

    var bodyString = JSON.stringify(body);

    // Philips is silly and doesn't use 0-based indexing
    options.path = '/api/newdeveloper/lights/' + (bulb + 1) + '/state';

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
	req.end();
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
                console.log('blinking for index ' + userIndex)
                if(answer == "in")
                {
                    color = 25500; // green
                } 
                else
                {
                    color = 0; // red
                }  
                blink(userIndex, color);
                userArray[userIndex].status = answer; // updates local status to match
            }
        });

    });
}
