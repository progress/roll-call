### Project Description
This project links an iOS app with a Node.js http server and a Mongo database. The iOS app tracks a specified iBeacon region and reports to the server upon entering and exiting the region. The server stores this data in MongoDB. The information can be viewed in both log and table form here. The username and password for the database are stored in a config.json file which has not been uploaded. Anyone wishing to use this source code would need to create their own local config.json file with credentials specific to their database. The LocalHue subdirectory contains a local node server that controls Philips Hue lights corresponding to the different users in the database. When these users enter or exit the beacon region the lights will blink accordingly. Lastly, the HueController app contains an iOS app that allows for full control of the Hues from outside the local network, using the LocalHue server mentioned earlier. 
### Project Directories
LocalHue - This subdirectory contains the local Node server used for controlling the Hue lightbulbs.

HueController - This subdirectory contains the iOS app that can control the hues from anywhere through the node server.

### Relevant Blog Posts
[My First Beacon App](http://dcinglis.wordpress.com/2014/06/27/my-first-beacon-app/)

[The Roll Call App](http://dcinglis.wordpress.com/2014/07/15/the-roll-call-app-integrating-beacons-with-node-js-and-mongodb/)

[Provisioning an iOS App](http://dcinglis.wordpress.com/2014/08/21/provisioning-an-ios-app-for-ad-hoc-testing/)
