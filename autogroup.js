var request = require("request"),
    jsdom = require("jsdom").jsdom,
    async = require("async");

var url = "http://viviz.org/gallery/images/autoplot-tests/";
var MAX_ITEMS = 10;
var HASH_LENGTH = 10;
var MAX_NUM_TOKENS = 10;

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
                process(links.slice(0, 100));
        });
    }
})

function process(urls){
    // filter out unrelevant links
    urls = urls.filter(function(url){
        return url.search(/vap\+cdaweb/) >= 0;
    })

    // tokenize urls
    var items = urls.map(function(url){
        return {
            url: url,
            tokens: tokenize(url)
        }
    })
    
    var root = {
        name: "root",
        items: items,
    }
    divide(root, 0);
    print(root);
}

function tokenize(url){
    var ret = [];
    var tmp = url.split(":");
    ret.push(tmp[0]);
    tmp = tmp[1].split("&");
    tmp.forEach(function(item){
        item.split("=")[1]
            .split(/[_\-\.]/)
            .forEach(function(e){
                ret.push(e);
            });
    });
    return ret;
}

function divide(node, ithToken){
    if(node.items.length ===1 || ithToken >= MAX_NUM_TOKENS){
        return;
    }
    if(!node.children){
        node.children = [];
    }
    while(node.items.length>0){
        var item = node.items.shift();
        var token =  item.tokens[ithToken];
        var found = false;
        for(var j=0;j<node.children.length;j++){
            if(node.children[j].name===token){
                node.children[j].items.push(item);
                found = true;
                break;
            }
        }
        if(!found){
            var newNode = {
                parent: node,
                name: token,
                items: []
            }
            newNode.items.push(item);
            node.children.push(newNode);
        }
    }
    node.children.forEach(function(child){
        divide(child, ithToken+1);
    })
}

// function calHash(token){
//     if(!token){
//         return 0;
//     }
//     // if token represents a number, return 0
//     if(/^[0-9]+$/.test(token)){
//         return 0;
//     }
//     // token represents a string containing only 0-9, a-z, A-Z
//     var ret = 0;
//     for(var i =0;i<HASH_LENGTH;i++){
//         var code = token.charCodeAt(i)||0;
//         if(code<=57) {
//             ret = ret * 62 + code - 48;
//         } else {
//             ret = ret * 62 + code - 55;
//         }
//     }
//     return ret;
// }

function print(node, level){
    level=level||0;
    var indent = "";
    for(var i=0;i<level;i++){
        indent+="  ";
    }
    console.log(indent+node.name);
    indent+="  ";
    node.items.forEach(function(item){
        console.log(indent+item.url);
    })
    if(node.children) {
        node.children.forEach(function(child){
            print(child, level+1);
        })
    }
}

function postOrderTraverse(node, visit){
    if(node.children){
        node.children.forEach(function(child){
            postOrderTraverse(child, visit);
        })
    }
    visit(node);
}

function mergeSingle(node){
    if(!node.children){
        return;
    }
    if(node.children.length===1){
        node.name = node.children[0].name;
        node.items = node.children[0].items;
        node.children = node.children[0].children;
        return;
    } else {
        node.children.sort(function(a,b){
            return a.name - b.name;
        });
        var count = 0; 
        var start = 0;
        var newChildren = [];
        for(var i=0;i<node.children.length;i++){
            var child = node.children[i];
            var size = child.children ? child.children.length + child.items.length : child.items.length;
            if(count+size>MAX_ITEMS){
                var newNode = {
                    parent: node,
                    name: "",
                    items: [],
                    children: []
                }
                if(start===i-1){
                    newNode.name = node.children[start].name;
                } else {
                    newNode.name = node.children[start].name+" - "+node.children[i-1].name;
                }
                for(var j=start;j<i;j++){
                    newNode.children = newNode.children.concat(node.children[j].children||[]);
                    newNode.items = newNode.items.concat(node.children[j].items);
                }
                newChildren.push(newNode);
                count=0;
                start=i;
            } else {
                count+=size;
            }

        }
        node.children = newChildren;
    }
}

function merge(node){
    if(!node.children){
        if(node.items.length===1){

        }
        return;
    }
    if(node.children.length===1){
        // node.name = node.children[0].name;
        node.items = node.children[0].items;
        node.children = node.children[0].children;
        
        merge(node);
    } 
    else{
        // if(node.children && node.children.length>MAX_ITEMS){
        //     node.children.sort(function(a,b){
        //         return a.name - b.name;
        //     });
        //     var count = 0; 
        //     var start = 0;
        //     var newChildren = [];
        //     for(var i=0;i<node.children.length;i++){
        //         var child = node.children[i];
        //         var size = child.children ? child.children.length +child.items.length: child.items.length;
        //         if(count+size>MAX_ITEMS || i==node.children.length-1){
        //             var newNode = {
        //                 parent: node,
        //                 name: "",
        //                 items: [],
        //                 children: []
        //             }
        //             if(start===i-1){
        //                 newNode.name = node.children[start].name;
        //             } else {
        //                 newNode.name = node.children[start].name+" - "+node.children[i-1].name;
        //             }
        //             for(var j=start;j<i;j++){
        //                 newNode.children = newNode.children.concat(node.children[j].children||[]);
        //                 newNode.items = newNode.items.concat(node.children[j].items);
        //             }
        //             newChildren.push(newNode);
        //             count=0;
        //             start=i;
        //         } else {
        //             count+=size;
        //         }

        //     }
        //     node.children = newChildren;
        // }
        node.children.forEach(merge);
    }
}

Array.prototype.find=function(value){
    for(var i=0;i<this.length;i++){
        if(this[i]===value){
            return i;
        }
    }
    return -1;
}

Array.prototype.remove=function(value){
    var index = this.find(value);
    if(index!==-1){
        this.splice(index, 1);
    }
}