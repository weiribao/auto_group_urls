var builder = require("xmlbuilder");

var MAX_ITEMS = 10;
var HASH_LENGTH = 10;
var MAX_NUM_TOKENS = 10;

function process(urls, tokenize){
    tokenize = tokenize ? tokenize : default_tokenize;
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
    merge(root);
    return root;
}
exports.process = process;

function default_tokenize(url){
    var ret = [];
    var tmp = url.split("?");
    if(tmp.length===1){
        tmp = url.split(":");
    }
    ret.push(tmp[0]);
    tmp = tmp[1].split(/&/);
    tmp.forEach(function(item){
        // item.split("=")[1]
        item
            .split(/[_\-\.]/)
            .forEach(function(e){
                ret.push(e);
            });
    });
    return ret;
}

function divide(node, ithToken){
    if(node.items.length <= MAX_ITEMS){
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

function merge(node){
    if(!node.children){
        return;
    }
    if(node.children.length > MAX_ITEMS){
        var groupSize = MAX_ITEMS;
        var newChildren = [];
        for(var i=0, j=-1;i<node.children.length;i++){
            if(i%groupSize===0){
                newChildren.push(node.children[i]);
                j++;
            } else {
                // console.log(i, j, newChildren, newChildren[j]);
                newChildren[j].items = newChildren[j].items.concat(node.children[i].items);
                newChildren[j].name = newChildren[j].name.split(" - ")[0]+" - "+node.children[i].name;
            }
        }
        node.children = newChildren;
    }
    node.children.forEach(function(child){
        merge(child);
    });
}

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
exports.print = print;

function printXml(node){
    // var doc = builder.create();
    var ele = builder.create("bookmark-list")
                        .att("version", 1.1);
    node.items.forEach(function(item){
        var d=ele.ele("bookmark");
        d.ele("title", item.url);
        d.ele("url", item.url);
    })
    if(node.children){
        node.children.forEach(function(child){
            var d=ele.ele("bookmark-folder");
            d.ele("title", child.name);
            printXmlRecur(child, d);
        })    
    }
    return ele.end({ 'pretty': true, 'indent': '  ', 'newline': '\n' });

    function printXmlRecur(node, d){
        var ele = d.ele("bookmark-list");
        node.items.forEach(function(item){
            var d=ele.ele("bookmark");
            d.ele("title", item.url);
            d.ele("url", item.url);
        })
        if(node.children){
            node.children.forEach(function(child){
                var d=ele.ele("bookmark-folder");
                d.ele("title", child.name);
                printXmlRecur(child, d);
            })
        }
    
    }
}
exports.printXml = printXml;

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