const url = require('url');
const fs = require('fs');
const path = require('path')
const ejs = require('ejs')
const querystring = require("querystring")

function render (filePath,data){
    var str = fs.readFileSync(path.resolve('./views',filePath),'utf-8')
    var html = ejs.render(str,data)
    return html
}

var articles=[]

var handlers={
    '/article/new':function(req,res){
        var html = render('new-article.html')
        res.writeHead(200,{'Content-Type':'text/html'})
        res.end(html)
    },
    '/show-article':function(req,res){
        var query  = url.parse(req.url,true).query
        var id = query.id 
        var article = fs.readFileSync(path.resolve('./articles',id.toString()),'utf-8')
        var params = querystring.parse(article)
        var html = render('show-article.html', { params: params });
        res.writeHead(200,{'Content-type':'text/html'})
        res.end(html)
    },
    '/articles':function(req,res){
        if(req.method === "POST"){
            var data=""
            req.on('data',function(chunk){
                data+=chunk
            })

            req.on('end',function(){
                    data=decodeURI(data)
                    var id = Date.now().toString()
                    articles.push(id)
                    fs.writeFileSync(path.resolve('./articles',id),data,'utf-8')
                    res.writeHead(302,{'Location':'http:///127.0.0.1:8080/show-article?id='+id})
                    res.end()
            })

        }else if(req.method === "GET"){
            var html=render('article-list.html',{articles:articles})
            res.writeHead(200,{'Content-type':'text/html'})
            res.end(html)
        }
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
    if(articles.length === 0){
        console.log("dir")
        var dir = fs.readdirSync("./articles")
        console.log(dir)
        articles = dir
    }
    var filePath = url.parse(req.url,true).pathname
   // console.log(filePath)
    if(typeof handlers[filePath] === "function"){
        handlers[filePath](req,res)
    }else{
        handlers["*"](req,res)
    }
}
