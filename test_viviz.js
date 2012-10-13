var request = require("request"),
    jsdom = require("jsdom").jsdom;

var group = require("./group");

var url = "http://viviz.org/gallery/images/autoplot-tests/";

// fetch and parse links from url
request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        jsdom.env({
            html: body,
            scripts: ['http://code.jquery.com/jquery-1.5.min.js']
            }, function(err, window) {
                var $ = window.jQuery;
                // jQuery is now loaded on the jsdom window created from 'agent.body'
                var links = [];
                $("a").each(function(a){
                    links.push($(this).text());
                });
                // filter out unrelevant links
                links = links.filter(function(url){
                    return url.search(/vap\+cdaweb/) >= 0;
                })

                // var root = group.process(links.slice(99, 200));
                var root = group.process(links);
                group.print(root);
                console.log(group.printXml(root));
        });
    } else {
	console.log("http error");
	}
})

