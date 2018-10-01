var express = require('express');
var app= express();
app.get('/',function(req,res){
	res.send('hello world');
});
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000;
var   ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
app.listen(port,ip);