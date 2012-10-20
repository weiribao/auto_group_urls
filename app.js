var express = require('express'),
	app = express(),
	server = require("http").createServer(app),
	fs = require("fs");

var group = require("./group.js");
// middleware
app.use(express.bodyParser());

app.get("/", function(req, res){
	res.send("Usage: post / {urls: [url1, url2, ...]}<form action='/' method='post'><textarea name='urlstr' rows='30' cols='80'></textarea><br><input type='submit' value='submit'></form>");
})
app.post("/", function(req, res){
	console.log(req.body);
	var urls = req.body.urls || parseSource(req.body.urlstr) || [];
	console.log(urls);
	var doc = group.printXml(group.process(urls));
	res.send(doc);
});

app.listen(8001);

function parseSource(raw){
	var source = raw
			.trim()
			.replace("\r", "")
			.split(/[\r\n]+/)
			.filter(function(line){
				return line.trim()!="";
			});
	return source;
}