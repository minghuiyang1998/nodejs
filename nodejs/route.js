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

function route(req,res,data){
    var filePath = url.parse(req.url,true).pathname
    console.log(filePath)
    if(/^\/article\/new$/.test(filePath)){
        handlers["/article/new"](req,res)
     }else if(/^\/article\/(.+)\/edit$/.test(filePath)){
         handlers["/article/*/edit"](req,res)
     }else if(/^\/articles$/.test(filePath)){
         handlers["/articles"](req,res,data)
     }else if(/^\/article$/.test(filePath)){
             handlers["/article"](req,res,data)
     }else if(/^\/helloworld$/.test(filePath)){
         handlers["/hello-world"](req,res)
     }else{
         handlers["*"](req,res)
     }
}

var method={
    'POST':function(req,res){
        console.log("POST")
        var data=""
        req.on('data',function(chunk){
            data+=chunk
        })
        req.on('end',function(){
            data=decodeURI(data)
            route(req,res,data)
        })
    },
    'GET':function(req,res){
        console.log("GET")
        route(req,res,null)
    },
    'DELETE':function(req,res){
        console.log("delete success")
        res.writeHead(200,{'Content-Type':'text/html'})
        res.end() 
    }
}

var handlers={
    '/article/new':function(req,res){
        console.log("new")
        var html = render('new-article.html')
        res.writeHead(200,{'Content-Type':'text/html'})
        res.end(html)
    },
    '/article/*/edit':function(req,res){
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
    '/article':function(req,res,data){
        console.log("detail")
        var query  = url.parse(req.url,true).query
        var id = query.id 
        if(data === null){
            console.log(2)
            var article = fs.readFileSync(path.resolve('./articles',id),'utf-8')
            var article_params = querystring.parse(article)
            var html = render('show-article.html', { params: article_params });
            res.writeHead(200,{'Content-type':'text/html'})
            res.end(html)
        }else {
            console.log(3)
            var params = querystring.parse(data)
            if(params._method === "PUT"){
                console.log("PUT")
                console.log(id)
                var article = fs.readFileSync(path.resolve('./articles',id),'utf-8')
                var article_params = querystring.parse(article)
                for(var item in params){
                    if(params[item].length != 0 && article_params[item] != params[item]){
                        article_params[item] = params[item]
                    }
                }
                article = querystring.stringify(article_params)
                fs.writeFileSync(path.resolve('./articles',id),article,'utf-8') 
                res.writeHead(302,{'Location':'http://127.0.0.1:8080/article?id='+id})
                res.end()   
            }else if(params._method === "DELETE"){
                fs.unlinkSync(path.resolve('./articles',id))
                res.writeHead(302,{'Location':'http://127.0.0.1:8080/articles'})
                res.end()
            }
        }
    },
    '/articles':function(req,res,data){
        console.log("articles")
        if(data === null){
            console.log(2)
            var articles = fs.readdirSync("./articles")
            var html=render('article-list.html',{articles:articles})
            res.writeHead(200,{'Content-type':'text/html'})
            res.end(html)
        }else{
            console.log(3)
            var id = Date.now().toString()
            console.log(data)
            fs.writeFileSync(path.resolve('./articles',id),data,'utf-8')
            res.writeHead(302,{'Location':'http:///127.0.0.1:8080/article?id='+id})
            res.end()
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
    method[req.method](req,res)
}
