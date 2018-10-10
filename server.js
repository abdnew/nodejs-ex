var express = require('express'),
    app     = express(),
    morgan  = require('morgan'),
	  fs      = require('fs'),
    path    = require("path"),
	  socket  = require('socket.io'),
    WebSocket = require('ws'),
    chat_worker = require('./scripts/serverChatWorker.js');
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

////////////////////////////////////////////////////////

    Object.assign=require('object-assign')

    app.engine('html', require('ejs').renderFile);
    app.use(morgan('combined'))

    var mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
        mongoURLLabel = "";

    if (mongoURL == null) {
      var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
      // If using plane old env vars via service discovery
      if (process.env.DATABASE_SERVICE_NAME) {
        var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
        mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
        mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
        mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
        mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
        mongoUser = process.env[mongoServiceName + '_USER'];

      // If using env vars from secret from service binding
      } else if (process.env.database_name) {
        mongoDatabase = process.env.database_name;
        mongoPassword = process.env.password;
        mongoUser = process.env.username;
        var mongoUriParts = process.env.uri && process.env.uri.split("//");
        if (mongoUriParts.length == 2) {
          mongoUriParts = mongoUriParts[1].split(":");
          if (mongoUriParts && mongoUriParts.length == 2) {
            mongoHost = mongoUriParts[0];
            mongoPort = mongoUriParts[1];
          }
        }
      }

      if (mongoHost && mongoPort && mongoDatabase) {
        mongoURLLabel = mongoURL = 'mongodb://';
        if (mongoUser && mongoPassword) {
          mongoURL += mongoUser + ':' + mongoPassword + '@';
        }
        // Provide UI label that excludes user id and pw
        mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
        mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
      }
    }
    var db = null,
        dbDetails = new Object();

    var initDb = function(callback) {
      if (mongoURL == null) return;

      var mongodb = require('mongodb');
      if (mongodb == null) return;

      mongodb.connect(mongoURL, function(err, conn) {
        if (err) {
          callback(err);
          return;
        }

        db = conn;
        dbDetails.databaseName = db.databaseName;
        dbDetails.url = mongoURLLabel;
        dbDetails.type = 'MongoDB';

        console.log('Connected to MongoDB at: %s', mongoURL);
      });
    };

    app.get('/', function (req, res) {
      // try to initialize the db on every request if it's not already
      // initialized.
      if (!db) {
        initDb(function(err){});
      }
      if (db) {
        var col = db.collection('counts');
        // Create a document with request IP and current time of request
        col.insert({ip: req.ip, date: Date.now()});
        col.count(function(err, count){
          if (err) {
            console.log('Error running count. Message:\n'+err);
          }
          res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
        });
      } else {
        res.render('index.html', { pageCountMessage : null});
      }
    });

    app.get('/pagecount', function (req, res) {
      // try to initialize the db on every request if it's not already
      // initialized.
      if (!db) {
        initDb(function(err){});
      }
      if (db) {
        db.collection('counts').count(function(err, count ){
          res.send('{ pageCount: ' + count + '}');
        });
      } else {
        res.send('{ pageCount: -1 }');
      }
    });

    // error handling
    app.use(function(err, req, res, next){
      console.error(err.stack);
      res.status(500).send('Something bad happened!');
    });

    initDb(function(err){
      console.log('Error connecting to Mongo. Message:\n'+err);
    });


/////////////////////////////////////////////////////////////////


var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var log_file= './data/log.json';
var logs = [];
logs.push([]);

var connections_id=[];

Object.assign=require('object-assign')
//app.use('/aaa',express.static(__dirname));

app.get('/logs', function(req, res) {
   console.log('Someone Asked For Logs');
   res.sendFile(path.join(__dirname, './public', '/logs.html'));

//	res.json(logs[0]);
});
app.get('/test', function(req, res) {
  res.send('THIS IS WORKING');
});

var con_server = app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

var io = socket(con_server);
io.on('connection', function (socket){
	console.log('new connection: ',socket.id);
	connections_id.push(socket.id);
  io.to(socket.id).emit('logs',logs);
});
app.post('/logs', function(req, res) {
	logs[0].push(req.body);
	res.send(req.body);
  console.log(req.body);
	for (var i=0;i<connections_id.length;i++){
		io.to(connections_id[i]).emit('update',req.body);
	}
});

function postLogs(data){
  logs[0].push(data);
  for (var i=0;i<connections_id.length;i++){
		io.to(connections_id[i]).emit('update',data);
	}
}

var server = 'irc-ws.chat.twitch.tv';
var irc_port = 443;
var channel= 'swiftor';
var client = new WebSocket('wss://' + server + ':' + irc_port + '/', 'irc');

client.connect = function connect(){
    client.onmessage = this.onMessage.bind(this);
    client.onerror = this.onError.bind(this);
    client.onclose = this.onClose.bind(this);
    client.onopen = this.onOpen.bind(this);
}
client.onError = function onError(message){
    console.log('Error: ' + message);
}

client.onMessage = function onMessage(message){
    if(message !== null){
        var parsed = chat_worker.parseMessage(message.data);
        if(parsed !== null){
      //    console.log(parsed);
            if(parsed.command === "PRIVMSG") {
              var parsed_tags=chat_worker.getTags(parsed.tags);
              if (parsed_tags.bits>0){
				        var data = {type: 'Cheer',ammount:parsed_tags.bits,name: parsed.username ,display_name: parsed_tags.display_name,time: new Date()};
                postLogs(data);
              }
              else if ((parsed_tags.mod||parsed_tags.broadcaster)&&parsed.message.startsWith('!')){
              switch (parsed.message) {
                case '!meterreset':meter_reset('0');break;
                default:
                  if (parsed.message.startsWith('!meterreset ')){
                    var words= parsed.message.split(" ");
                    if (words.length==2){
                      meter_reset(words[1]);
                    }
                  }
                }
              }
            }
            else if (parsed.command === "USERNOTICE"){
              var parsed_tags=chat_worker.getTags(parsed.tags);
              var sub_info= chat_worker.getSubInfo(parsed.original);
              if (sub_info.msg_id=='sub'){
        				var data = {type: 'New Sub',ammount: '1',tier: sub_info.plan,name: parsed.username ,display_name: parsed_tags.display_name,message:sub_info.msg,time: new Date()};
        				postLogs(data);
              }
              else if (sub_info.msg_id=='resub'){
        				var data = {type: 'ReSub',ammount:sub_info.time,tier: sub_info.plan,name: parsed.username ,display_name: parsed_tags.display_name,message:sub_info.msg ,time: new Date()};
        				postLogs(data);
              }
              else if (sub_info.msg_id=='subgift'){
                var data = {type: 'Gifted Sub',ammount:sub_info.time,tier: sub_info.plan,name: parsed.username ,display_name: parsed_tags.display_name,message:'Gifted: '+ sub_info.gifted,time: new Date()};
				        postLogs(data);
              }
              else if (sub_info.msg_id=='giftpaidupgrade'){
        				var data = {type: 'Gifted Sub Upgrade',ammount:sub_info.time,tier: sub_info.plan,name: parsed.username ,display_name: parsed_tags.display_name,time: new Date()};
        				postLogs(data);
              }
              else{
                console.log(parsed.original);
              }
            }
            else if(parsed.command === "PING") {
                client.send("PONG :" + parsed.message);
            }
      			else if (parsed.original.startsWith(':tmi.twitch.tv 001')){
      			console.log('Joining');
      			client.send('JOIN #'+channel);
      		}
        }
    }
};

client.onOpen = function onOpen(){
    if (client !== null && client.readyState === 1) {
        console.log('Connecting...');
        client.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
        client.send('PASS justinfan3369');
        client.send('NICK justinfan3369' );
    }
};

client.onClose = function onClose(){
    console.log('Disconnected.');
};

client.close = function close(){
    if(client){
        client.close();
    }
};

function meter_reset(a){

}

client.connect();
exports.app = app ;
