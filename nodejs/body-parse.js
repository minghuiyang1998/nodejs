const url = require('url');
const querystring = require("querystring")
var multipart = require("multiparty")

module.exports = function(req){
    return new Promise((resolve,reject)=>{
        var id = null
        if(req.method === 'POST'){
            id = Date.now().toString()
        }else if(req.method === 'PUT'){
            var query  = url.parse(req.url,true).query
            id = query.id 
        }else{
            resolve()
        }

        //console.log(req.headers["content-type"])
        if(/^application\/x-www-form-urlencoded/.test(req.headers["content-type"])){
            var data = ""
            req.on('data',function(chunk){
                data+=chunk
            })
            req.on('end',function(){
                data = decodeURI(data)
                data = querystring.parse(data)
                req.bodyData = data
                req.articleId = id
                resolve()
            })
        }else if(/^multipart\/form-data/.test(req.headers["content-type"])){
            var form = new multipart.Form()
            form.parse(req,function(err,fields,files){
                req.fields = fields
                req.files = files
                req.articleId = id
                resolve()
            })
        }
    })
}
