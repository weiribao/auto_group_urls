var request = require("request"),
    jsdom = require("jsdom").jsdom,
    xml2js = require('xml2js'),
    parser = new xml2js.Parser();

var url = "http://autoplot.org/bookmarks/SuperMAG.xml";

// fetch and parse links from url
request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        parser.parseString(body, function(err, res){
            if(!err){
                var links = getUrls(res);
                postUrls(links, function(body){
                    console.log(body);
                });       
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

function postUrls(links, callback){
    var obj = {
        urls: links
    }
    console.log(obj);
    request({
        method: "post",
        headers: {
            "Content-type": "application/json"
        },
        uri: "http://localhost:8001/",
        body: JSON.stringify(obj)
    }, function(err, res, body){
        callback(body);
    });
}