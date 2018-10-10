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
var port = 443;
var channel= 'swiftor';
var client = new WebSocket('wss://' + server + ':' + port + '/', 'irc');

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
