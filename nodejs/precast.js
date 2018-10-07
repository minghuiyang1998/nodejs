const url = require('url');
const fs = require('fs');
const path = require('path')
const querystring = require("querystring")

var method={
    'POST':function(req){
        console.log("POST")
        var data=""
        var id = Date.now().toString()
        req.on('data',function(chunk){
            data+=chunk
        })
        req.on('end',function(){
            data=decodeURI(data)
            console.log(data)
            fs.writeFileSync(path.resolve('./articles',id),data,'utf-8')
        })
        return id
    },
    'GET':function(req){
        console.log("GET")
    },
    'DELETE':function(req){
        console.log("DELETE")
        var query  = url.parse(req.url,true).query
        var id = query.id 
        fs.unlinkSync(path.resolve('./articles',id))
    },
    'PUT':function(req){
        console.log("PUT")
        var data=""
        var query  = url.parse(req.url,true).query
        var id = query.id 
        req.on('data',function(chunk){
            data+=chunk
        })
        req.on('end',function(){
            data=decodeURI(data)
            console.log(id)
            var article = fs.readFileSync(path.resolve('./articles',id),'utf-8')
            var article_params = querystring.parse(article)
            console.log(data)
            var params = querystring.parse(data)
            for(var item in params){
                if(params[item].length != 0 && article_params[item] != params[item]){
                    article_params[item] = params[item]
                }
            }
            article = querystring.stringify(article_params)
            fs.writeFileSync(path.resolve('./articles',id),article,'utf-8') 
        })

    }
}

module.exports = method