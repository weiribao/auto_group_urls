var express = require('express'),
	app = express(),
	server = require("http").createServer(app),
	fs = require("fs");

var group = require("./group.js");
// middleware
app.use(express.bodyParser());

app.get("/", function(req, res){
	res.send("Usage: post / {urls: [url1, url2, ...]}\n");
})
app.post("/", function(req, res){
	// console.log(req.body);
	var doc = group.printXml(group.process(req.body.urls));
	res.send(doc);
});

app.listen(8001);