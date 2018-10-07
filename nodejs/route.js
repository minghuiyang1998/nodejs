const url = require('url');
const fs = require('fs');
const path = require('path')
const ejs = require('ejs')
const querystring = require("querystring")
const method = require("./precast")

function render (filePath,data){
    var str = fs.readFileSync(path.resolve('./views',filePath),'utf-8')
    var html = ejs.render(str,data)
    return html
}

function route(req,res){
    var filePath = url.parse(req.url,true).pathname
    console.log(filePath)
    if(/^\/article\/(.+)\/edit$/.test(filePath)){
        handlers["GET /article/*/edit"](req,res)
    }else{
        var distinguish = req.method+' '+filePath
        if(typeof handlers[distinguish] === "function"){
            handlers[distinguish](req,res)
        }else{
            handlers["GET *"](req,res)
        }
    }
}

var handlers={
    'GET /article/new':function(req,res){
        method["GET"](req)
        console.log("new")

        var html = render('new-article.html')
        res.writeHead(200,{'Content-Type':'text/html'})
        res.end(html)
    },
    'GET /article/*/edit':function(req,res){
        method["GET"](req)
        console.log("edit")

        var pathname = url.parse(req.url,true).pathname
        var id = /^\/article\/id=(.+)\/edit$/.exec(pathname)[1]
        var article = fs.readFileSync(path.resolve('./articles',id),'utf-8')
        var params = querystring.parse(article)
        params['id'] = id

        var html = render('modify-article.html',{params:params})
        res.writeHead(200,{"Content-type":"text/html"})
        res.end(html)
    },
    'GET /article':function(req,res){
        method["GET"](req) 
        console.log("detail")

        var query  = url.parse(req.url,true).query
        var id = query.id 
        var article = fs.readFileSync(path.resolve('./articles',id),'utf-8')
        var article_params = querystring.parse(article)

        var html = render('show-article.html', { params: article_params });
        res.writeHead(200,{'Content-type':'text/html'})
        res.end(html)
    },
    'GET /articles':function(req,res){
        method["GET"](req)
        console.log("articles")

        var articles = fs.readdirSync("./articles")

        var html=render('article-list.html',{articles:articles})
        res.writeHead(200,{'Content-type':'text/html'})
        res.end(html)
    },
    'GET /hello-world':function(req,res){
        method["GET"](req,res)
        console.log("hello-world")

        res.writeHead(200,{'Content-type':'text/html'})
        var html = render('hello-world.html')
        res.end(html)
    },
    "GET *":function(req,res){
        method["GET"](req)
        console.log("404")

        res.writeHead(404,{'Content-type':'text/html'})
        var html = render('404.html')
        res.end(html)
    },
    "POST /articles":function(req,res){
        var id = method["POST"](req)

        if(req.headers.accept === "text/html"){
            res.writeHead(200,{"Content-type":"text/html"})
            html='http://127.0.0.1:8080/article?id='+id
            res.end(html)
        }
    },
    "DELETE /article":function(req,res){
        method["DELETE"](req)

        if(req.headers.accept === "text/plain"){
            res.writeHead(200,{'Content-Type':'text/plain'})
            res.end("success")
        }
    },
    "PUT /article":function(req,res){
        method["PUT"](req)
        var query  = url.parse(req.url,true).query
        var id = query.id 
        
        if(req.headers.accept === "text/html"){
            res.writeHead(200,{"Content-type":"text/html"})
            html='http://127.0.0.1:8080/article?id='+id
            res.end(html) 
        }  
    }

}

module.exports = function(req,res){
    route(req,res)
}
