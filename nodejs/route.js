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
        console.log(id)
        var article = fs.readFileSync(path.resolve('./articles',id.toString()),'utf-8')
        var params = querystring.parse(article)
        params['id'] = id
        var html = render('modify-article.html',{params:params})
        res.writeHead(200,{"Content-type":"text/html"})
        res.end(html)
    },
    '/article':function(req,res){
        console.log("details")
        if(req.method === "GET"){
            var query  = url.parse(req.url,true).query
            var id = query.id 
            var article = fs.readFileSync(path.resolve('./articles',id.toString()),'utf-8')
            var params = querystring.parse(article)
            var html = render('show-article.html', { params: params });
            res.writeHead(200,{'Content-type':'text/html'})
            res.end(html)
        }else if(req.method === "POST"){
            var data=""
            req.on('data',function(chunk){
                data+=chunk
            })
            req.on('end',function(){
                data=decodeURI(data)
                var params = querystring.parse(data)
                var pathname  = url.parse(req.url,true).pathname
                var id = /^\/article\/id=(.+)$/.exec(pathname)[1]
                if(params._method === "PUT"){
                    var article = fs.readFileSync(path.resolve('./articles',id),'utf-8')
                    var article_params = querystring.parse(article)
                    for(var item in params){
                        if(params[item].length != 0 && article_params[item] != params[item]){
                            article_params[item] = params[item]
                        }
                    }
                    article = querystring.stringify(article_params)
                    fs.writeFileSync(path.resolve('./articles',id),article,'utf-8') 
                    res.writeHead(302,{'Location':'http:///127.0.0.1:8080/article?id='+ parseInt(id)})
                    res.end()   
                }else if(_method === "DELETE"){


                    
                }
            })
        }
    },
    '/articles':function(req,res){
        console.log("list")
        if(req.method === "POST"){
            var data=""
            req.on('data',function(chunk){
                data+=chunk
            })

            req.on('end',function(){
                    data=decodeURI(data)
                    var id = Date.now().toString()
                    fs.writeFileSync(path.resolve('./articles',id),data,'utf-8')
                    res.writeHead(302,{'Location':'http:///127.0.0.1:8080/article?id='+id})
                    res.end()
            })
        }else if(req.method === "GET"){
            var articles = fs.readdirSync("./articles")
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
    var filePath = url.parse(req.url,true).pathname
    console.log(filePath)
    if(/^\/article\/new$/.test(filePath)){
       handlers["/article/new"](req,res)
    }else if(/^\/article\/(.+)\/edit$/.test(filePath)){
        handlers["/article/*/edit"](req,res)
    }else if(/^\/articles$/.test(filePath)){
        handlers["/articles"](req,res)
    }else if(/^\/article?(.+)$/.test(filePath)){
            handlers["/article"](req,res)
    }else if(/^\/helloworld$/.test(filePath)){
        handlers["/hello-world"](req,res)
    }else{
        handlers["*"](req,res)
    }
    // if(typeof handlers[filePath] === "function"){
    //     handlers[filePath](req,res)
    // }else{
    //     handlers["*"](req,res)
    //}
    
}
