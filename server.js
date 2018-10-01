var express = require('express');
var app= express();

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000;
var   ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);
