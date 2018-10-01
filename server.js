var express = require('express');
var app= express();

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000;
var   ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);


const TwitchJS = require('twitch-js');

    // Setup the client with your configuration; more details here:
    // https://github.com/twitch-apis/twitch-js/blob/master/docs/Chat/Configuration.md
    const options = {
      channels: ["#abd_new"],
      // Provide an identity
       identity: {
         username: "a_plus_bot",
         password: "oauth:mv9wq9z2abi4v8mplmaz6ot2356i67"
       },
    };

    const client = new TwitchJS.client(options);

    // Add chat event listener that will respond to "!command" messages with:
    // "Hello world!".
    client.on('chat', (channel, userstate, message, self) => {
      console
        .log(`Message "${message}" received from ${userstate['display-name']}`);

      // Do not repond if the message is from the connected identity.
      if (self) return;

      if (options.identity && message === '!command') {
        // If an identity was provided, respond in channel with message.
        client.say(channel, 'Hello world!');
     }
    });

    // Finally, connect to the channel
    client.connect();