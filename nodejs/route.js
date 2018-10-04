const url = require('url');
const fs = require('fs');
const path = require('path')
const ejs = require('ejs')
const querystring = require("querystring")

function render (filePath,data){
    console.log("render")
    var str = fs.readFileSync(path.resolve('./views',filePath),'utf-8')
    var html = ejs.render(str,data)
    return html
}

var handlers={
    '/form/new':function(req,res){
        var html = render('new-form.html')
        res.writeHead(200,{'Content-Type':'text/html'})
        res.end(html)
    },
    '/form':function(req,res){
        var data=""

        req.on('data',function(chunk){
            data+=chunk
        })

        req.on('end',function(){
                data=decodeURI(data)
                console.log(data)
                var dataObject = querystring.parse(data)
                console.log(dataObject)
                if(!fs.existsSync(dataObject.title+'.txt')){
                    fs.writeFileSync(path.resolve('./articals',dataObject.title+'.txt'),dataObject.content,'utf-8')
                }
                var params  = dataObject 
                console.log(params) 
                var html = render('show-form.html', { params: params });
                res.writeHead(200,{'Content-type':'text/html'})
                res.end(html)
        })
    // get
    //     var params  = url.parse(req.url,true).query   
    //     var html = render('show-form.html', { params: params });
    //     res.writeHead(200,{'Content-type':'text/html'})
    //     res.end(html)
    },
    '/hello-world':function(req,res){
        console.log("hello-world")
        res.writeHead(200,{'Content-type':'text/html'})
        var html = render('hello-world.html')
        res.end(html)
    },
    "*":function(req,res){
        console.log("404")
        res.writeHead(404,{'Content-type':'text/html'})
        var html = render('404.html')
        res.end(html)
    }
}

module.exports = function(req,res){
    console.log("enter route")
    var filePath = url.parse(req.url,true).pathname
    console.log(filePath)
    if(typeof handlers[filePath] === "function"){
        handlers[filePath](req,res)
    }else{
        handlers["*"](req,res)
    }
}
