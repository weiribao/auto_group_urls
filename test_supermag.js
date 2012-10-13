var request = require("request"),
    jsdom = require("jsdom").jsdom,
    xml2js = require('xml2js'),
    parser = new xml2js.Parser();

var group = require("./group");

var url = "http://autoplot.org/bookmarks/SuperMAG.xml";

// fetch and parse links from url
request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        parser.parseString(body, function(err, res){
            if(!err){
                var links = getUrls(res);
                var root = group.process(links);
                console.log(group.printXml(root));         
            }
        })
    }
})

function getUrls(doc){
    var ret = [];
    for(var key in doc){
        if(key==="bookmark"){
            var urls = doc[key].map(function(item){
                return item.url[0];
            });
            ret=ret.concat(urls);
        } else if(key==="bookmark-list"||key==="bookmark-folder"){
            if(Object.prototype.toString.call(doc[key])==='[object Array]'){
                doc[key].forEach(function(item){
                    ret = ret.concat(getUrls(item));
                });
            } else {
                ret = ret.concat(getUrls(doc[key]));
            }
        }
    }
    return ret;
}
