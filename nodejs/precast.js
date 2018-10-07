const url = require('url');
const fs = require('fs');
const path = require('path')
const querystring = require("querystring")
var multipart = require("multiparty")


var method={
    'POST':function(req){
        console.log("POST")
        var id = Date.now().toString()
        if(req.headers["content-type"]==='application/x-www-form-urlencoded'){
            var data = ""
            req.on('data',function(chunk){
                 data+=chunk
            })
            req.on('end',function(){
                data = decodeURI(data)
                data = querystring.parse(data)
                fs.writeFileSync(path.resolve('./data/articles',id),JSON.stringify(data),'utf-8')
            })
        }else if(req.headers["content-type"]==='text/plain'){

        }else{
            var form = new multipart.Form()
            form.parse(req,function(err,fields,files){
                var data = {}
                data['title'] = fields.title[0]
                data['content'] = fields.content[0]
                var imageName = id+'_poster'
                data['image'] = imageName
                fs.writeFileSync(path.resolve('./data/articles',id),JSON.stringify(data),'utf-8')

                var imagePath = files.image[0]['path'] 
                var image = fs.readFileSync(imagePath)
                fs.writeFileSync(path.resolve('./data',imageName),image)
            })
        }
        return id
    },
    'GET':function(req){
        console.log("GET")
    },
    'DELETE':function(req){
        console.log("DELETE")
        var query  = url.parse(req.url,true).query
        var id = query.id 
        var file = fs.readFileSync(path.resolve('./data/articles',id))
        var params = JSON.parse(file)
        fs.unlinkSync(path.resolve('./data',params.image))
        fs.unlinkSync(path.resolve('./data/articles',id))
    },
    'PUT':function(req){
        console.log("PUT")
        var data=""
        var query  = url.parse(req.url,true).query
        var id = query.id 
        if(req.headers["content-type"]==='application/x-www-form-urlencoded'){
            var data = ""
            req.on('data',function(chunk){
                 data+=chunk
            })
            req.on('end',function(){
                data = decodeURI(data)
                data = querystring.parse(data)

                var article = fs.readFileSync(path.resolve('./data/articles',id),'utf-8')
                var article_params = JSON.parse(article)

                for(var item in data){
                    if(data[item].length != 0 && article_params[item] != data[item]){
                        article_params[item] = data[item]
                    }
                }
                
                fs.writeFileSync(path.resolve('./data/articles',id),JSON.stringify(article_params),'utf-8')
            })
        }else if(req.headers["content-type"]==='text/plain'){

        }else{
            var form = new multipart.Form()
            form.parse(req,function(err,fields,files){
                var data = {}
                data['title'] = fields.title[0]
                data['content'] = fields.content[0]
                var imageName = id+'_poster'
                data['image'] = imageName

                var article = fs.readFileSync(path.resolve('./data/articles',id),'utf-8')
                var article_params = JSON.parse(article)

                if(data['image'].length!=0 && article_params['image'] != data['image']){
                    var imagePath = files.image[0]['path'] 
                    var image = fs.readFileSync(imagePath)
                    fs.writeFileSync(path.resolve('./data',imageName),image)
                    fs.unlink(path.resolve('./data',article_params.image))
                }

                for(var item in data){
                    if(data[item].length != 0 && article_params[item] != data[item]){
                        article_params[item] = data[item]
                    }
                }
                fs.writeFileSync(path.resolve('./data/articles',id),JSON.stringify(article_params),'utf-8')

            })
        }

    }
}

module.exports = method