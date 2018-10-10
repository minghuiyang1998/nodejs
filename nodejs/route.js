const url = require('url');
const fs = require('fs');
const path = require('path')
const ejs = require('ejs')
const bodyparse = require("./body-parse")

function render (filePath,data){
    var str = fs.readFileSync(path.resolve('./views',filePath),'utf-8')
    var html = ejs.render(str,data)
    return html
}


function route(req,res){
    var precast = bodyparse(req)
    precast.then(next)


    function next (){//上下文req
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
}

var handlers={
    'GET /article/new':function(req,res){
        console.log("new")
        var html = render('new-article.html')
        res.writeHead(200,{'Content-Type':'text/html'})
        res.end(html)
    },
    'GET /article/*/edit':function(req,res){
        console.log("edit")
        var pathname = url.parse(req.url,true).pathname
        var id = /^\/article\/id=(.+)\/edit$/.exec(pathname)[1]
        var article = fs.readFileSync(path.resolve('./data/articles',id),'utf-8')
        var params = JSON.parse(article)
        params['id'] = id

        var html = render('modify-article.html',{params:params})
        res.writeHead(200,{"Content-type":"text/html"})
        res.end(html)
    },
    'GET /article':function(req,res){
        console.log("detail")

        var query  = url.parse(req.url,true).query
        var id = query.id 
        console.log(id)
        var article = fs.readFileSync(path.resolve('./data/articles',id),'utf-8')
        var article_params =JSON.parse(article) 
        article_params.file = "http://127.0.0.1:8080/image?name="+article_params.file

        var html = render('show-article.html', { params:article_params});
        res.writeHead(200,{'Content-type':'text/html'})
        res.end(html)
    },
    'GET /image':function(req,res){
        console.log("image")
        var query = url.parse(req.url,true).query
        var name = query.name
        var content = fs.readFileSync(path.resolve('./data',name),'binary')
        res.writeHead(200,{'Content-type':'image/png'})
        res.write(content,'binary')
        res.end()

    },
    'GET /articles':function(req,res){
        console.log("list")

        var articles = fs.readdirSync("./data/articles")
        var html=render('article-list.html',{articles:articles})
        res.writeHead(200,{'Content-type':'text/html'})
        res.end(html)
    },
    'GET /hello-world':function(req,res){
        console.log("helloworld")
        res.writeHead(200,{'Content-type':'text/html'})
        var html = render('hello-world.html')
        res.end(html)
    },
    "GET *":function(req,res){
        console.log("404")
        res.writeHead(404,{'Content-type':'text/html'})
        var html = render('404.html')
        res.end(html)
    },
    "POST /articles":function(req,res){
        console.log("Post")
        var id = req.articleId
        //console.log(Object.keys(req))
        if(Object.keys(req).indexOf('bodyData')!=-1){ 
            var data = req.bodyData
            fs.writeFileSync(path.resolve('./data/articles',id),JSON.stringify(data),'utf-8')
        }else{
            var data = {}
            data['title'] = req.fields.title[0]
            data['content'] = req.fields.content[0]
            var fileName = id+'_poster'
            data['file'] = fileName
            //console.log(data)
            fs.writeFileSync(path.resolve('./data/articles',id),JSON.stringify(data),'utf-8')
            //console.log(req.files)
            var filePath = req.files.image[0]['path'] 

            var file = fs.readFileSync(filePath)
            fs.writeFileSync(path.resolve('./data',fileName),file)
        }
        res.writeHead(302,{"Location":'http://127.0.0.1:8080/article?id='+id})
        res.end()
    },
    "DELETE /article":function(req,res){
        console.log("delete")
        var query  = url.parse(req.url,true).query
        var id = query.id 
        var file = fs.readFileSync(path.resolve('./data/articles',id))
        var params = JSON.parse(file)

        fs.unlinkSync(path.resolve('./data',params.file))
        fs.unlinkSync(path.resolve('./data/articles',id))


        if(req.headers.accept === "text/plain"){
            res.writeHead(200,{'Content-Type':'text/plain'})
            res.end("success")
        }
    },
    "PUT /article":function(req,res){
        console.log("PUT")
        var id = req.articleId

        if(Object.keys(req).indexOf('bodyData')!=-1){
            var data = req.bodyData

            var article = fs.readFileSync(path.resolve('./data/articles',id),'utf-8')
            var article_params = JSON.parse(article)

            for(var item in data){
                if(data[item].length != 0 && article_params[item] != data[item]){
                    article_params[item] = data[item]
                }
            }
            
            fs.writeFileSync(path.resolve('./data/articles',id),JSON.stringify(article_params),'utf-8')
        
        }else{
            var data = {}
            console.log(Object.keys(req))
            console.log(req['fields'])
            data['title'] = req.fields.title[0]
            data['content'] = req.fields.content[0]
            var fileName = id+'_poster'
            data['file'] = fileName

            console.log(data)
            
            var article = fs.readFileSync(path.resolve('./data/articles',id),'utf-8')
            var article_params = JSON.parse(article)

            var filePath = req.files.image[0]['path'] 
            var file = fs.readFileSync(filePath)

            if(file.length!=0){
                fs.writeFileSync(path.resolve('./data',fileName),file)
                fs.unlink(path.resolve('./data',article_params.file))
                article_params['file'] = data['file']
            }


            for(var item in data){
                if(item != 'file' && data[item].length != 0 && article_params[item] != data[item]){
                    article_params[item] = data[item]
                }
            }
           
            fs.writeFileSync(path.resolve('./data/articles',id),JSON.stringify(article_params),'utf-8')

        }
        
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
