// David Inglis
// Progress Software - July 2014
// app.js
// A node server for communicating with iOS and MongoDB

// *** YOU NEED A config.json FILE FOR THIS PROJECT TO WORK ***
var config = require('./config.json');
// fields:
// username: your monogodb username
// password: your mongodb password
// dburl: the url for the database, mine was in the form: '@example.com:port/example'

// package declarations
var mongoose = require('mongoose');
var qs = require('querystring');
var http = require('http');
var express = require('express');

var app = express();
var activityLog = ""; // the homepage log of entrance/exit activity

// server connection
var conString = 'mongodb://' + config.username + ':' + config.password + config.dburl;
mongoose.connect(conString);
var db = mongoose.connection;

// models for the two dbs, one for app users, one for hue lightbulbs
var userModel = mongoose.model('users', {dbName: String, dbTime: String, dbIn: Boolean});
var newBulbModel = mongoose.model('bulbs', {bulb: String, bri: String, sat: String, hue: String,
                               outdated: Boolean, alert: String, effect: String});

// Modulus uses the process.env.PORT, locally it defaults to 3000 
app.set('port', process.env.PORT || 3000);

// Creates http server
var server = http.createServer(app);
server.listen(app.get('port'), function()
{
    console.log('Express server initialized on port ' + app.get('port'));
}); 

// Responds to homepage get requests
app.get('/', function(req, res)
{
    userModel.find(function(err, results)
    {
        if(err) console.log(err);
        else
        {
            // This wipes the user list
            /* 
            for(var i = 0; i < results.length; i++)
            {
                results[i].remove();
            }
            */
            res.write(jsonToTable(results));
            res.write(activityLog);
            res.write("</html>");
            res.end();
        }   
    });
});

app.get('/test', function(req, res)
{
    var data = {"name": "David", "id": 1234};
    res.writeHead(200, {"Content-Type": "application/json"});
    res.write(JSON.stringify(data));
    res.end();
});

// updates a bulb in the db using the specified parameters
app.get('/updateBulb', function(req, res)
{
    newBulbModel.findOne({bulb: req.query.bulb}, function(err, user)
    {
        if(err) console.log(err);
        else if (!user) // creates a new user if one doesn't exist
        {
            var temp = new newBulbModel({bulb: req.query.bulb, bri: req.query.bri,
                                      sat: req.query.sat, hue: req.query.hue,
                                      outdated: true, alert: req.query.alert,
                                      effect: req.query.effect});
            temp.save(function (err, tempUser)
            {
                if(err) console.log(err);
            });
        }
        else // updates existing user
        {
            user.bulb = req.query.bulb;
            user.bri = req.query.bri;
            user.sat = req.query.sat;
            user.hue = req.query.hue;
            user.outdated = true;
            user.alert = req.query.alert;
            user.effect = req.query.effect;
            user.save(function(err, tempUser)
            {
                if(err) console.log(err);
            });
        }
    });
    res.write('bulb updated successfully.');
    res.end();
});

// returns the status for a specified bulb
app.get('/bulbStatus', function(req, res)
{
    var str = req.query.bulb;
    newBulbModel.findOne({bulb: str}, function(err, user)
    {
        if(err) console.log(err);
        else if (!user)
        {
                console.log('user not found');
                res.write('no');
        }
        else
        {
            if(user.outdated)
            {
                user.outdated = false;
                user.save(function(err, tempUser)
                {
                    if(err) console.log(err);
                });

                var body = 
                {
                    "hue": user.hue,
                    "on": true,
                    "bri": user.bri,
                    "sat": user.sat,
                    "alert": user.alert,
                    "effect": user.effect
                };
                res.write(JSON.stringify(body));
            }
            else
            {
                console.log('user found, but not outdated');
                res.write('no');
            }
        }
        res.end();
    });
});

// Responds to requests for the status of a specific user
// parameters:
// name: the name of the user being queried 
app.get('/userStatus', function(req, res)
{
    console.log(req.query.name);
    userModel.findOne({dbName: req.query.name}, function(err, user)
    {
        console.log('found');
        if(err) console.log(err);
        else if (!user)
        {
            res.write('out');
        }
        else
        {
            if(user.dbIn)
            {
                res.write('in');
            }
            else
            {
                res.write('out');
            }
        }
        res.end();
    });
});

// Responds to homepage post requests sent from iOS
// iOS notifies the server when a user has entered/exited the beacon region
// This gets updated in the db
app.post('/', function(req, res)
{  
    newActivity = true;
    res.write('responding to post request'); // sent back to iOS
    
    // parses the request data
    var body = '';
    req.on('data', function (data)
    {
        body += data;
    });
    
    req.on('end', function() 
    {
        // request body is a string in "TIME,IN/OUT,NAME" format
        var arr = body.split(",");
        var time = arr[0];
        var didEnter;
        var name = arr[2];
        if(arr[1] === '1')        
        {
            didEnter = true;
            activityLog += time + ' ' + name + ' has entered the building. <br>';
        }
        else
        {
            didEnter = false;
            activityLog += time + ' ' + name + ' has left the building. <br>';
        }
        
        // attempts to find the user in the db
        userModel.findOne({dbName: name}, function(err, user)
        {
           if(err) console.log(err);
            else if (!user) // user doesn't exist, has to be created
            {
                console.log(name + ' could not be found');
                var temp = new userModel({dbName: name, dbTime: time, dbIn: didEnter});
                temp.save(function (err, tempUser)
                {
                    if(err) return console.error(err);
                });
            }
            else // user already exists
            {
                console.log(name + ' updated in db');
                user.dbTime = time;
                user.dbIn = didEnter;
                user.save(function (err, tempUser2)
                {
                    if(err) return console.error(err);
                });
            }
        });
        res.end();
    });
});

// converts a json array to an html table
function jsonToTable(raw) 
{
    var ret = "<html><table border = 1 cellspacing = 3 cellpadding = 5> <tr> <th>Name</th> <th>Status</th> <th>Time</th> </tr>";
    for(var i = 0; i < raw.length; i++)
    {
        ret += "<tr>";
        ret += "<th>" + raw[i]["dbName"] + "</th>";
        if(raw[i]["dbIn"])
        {
            ret += "<th>In</th>";
        }
        else
        {
            ret += "<th>Out</th>";
        }
        ret += "<th>" + raw[i]["dbTime"] + "</th>";
        ret += "</tr>";
    }
    ret += "</table>";
    return ret;
}



