// David Inglis
// Progress Software - July 2014
// app.js
// A node server for communicating with iOS and MongoDB

// package declarations
var config = require('./config.json');
var mongoose = require('mongoose');
var qs = require('querystring');
var http = require('http');
var express = require('express');

var app = express();
var activityLog = "";

// server connection

var conString = 'mongodb://' + config.username + ':' + config.password 
                + '@novus.modulusmongo.net:27017/eWizab7e';
mongoose.connect(conString);
var db = mongoose.connection;


var userModel = mongoose.model('users', {dbName: String, dbTime: String, dbIn: Boolean});
 
app.set('port', process.env.PORT || 3000);

// Creates http server
var server = http.createServer(app);
server.listen(app.get('port'), function()
{
    console.log(config.password);
    console.log(conString);
    console.log('Express server listening on port ' + app.get('port'));
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
            res.end(); // writes the user table
        }   
    });
});

// Responds to homepage post requests sent from iOS
app.post('/', function(req, res)
{  
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
            activityLog += time + ' ' + name + ' has entered the building. \n';
        }
        else
        {
            didEnter = false;
            activityLog += time + ' ' + name + ' has left the building. \n';
        }
        
        // attempts to find the user in the db
        userModel.findOne({dbName: name}, function(err, user)
        {
           if(err) console.log(err)
            else if (!user) // user doesn't exist, has to be created
            {
                var temp = new userModel({dbName: name, dbTime: time, dbIn: didEnter});
                temp.save(function (err, tempUser)
                {
                    if(err) return console.error(err);
                });
            }
            else // user already exists
            {
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
    var ret = "<table border = 1 cellspacing = 3 cellpadding = 5> <tr> <th>Name</th> <th>Status</th> <th>Time</th> </tr>";
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


