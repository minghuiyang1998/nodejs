const url = require('url');
const querystring = require("querystring")
var multipart = require("multiparty")

module.exports = function(req){
    return new Promise((resolve,reject)=>{
        req.params = {}
        console.log(req.params)
        req.params.setId = Date.now().toString()
        req.params.queryId= url.parse(req.url,true).query.id
        if(/^application\/x-www-form-urlencoded/.test(req.headers["content-type"])){
            var data = ""
            req.on('data',function(chunk){
                data+=chunk
            })
            req.on('end',function(){
                data = decodeURI(data)
                data = querystring.parse(data)
                req.params.fields = data
                resolve()
            })
        }else if(/^multipart\/form-data/.test(req.headers["content-type"])){
            var form = new multipart.Form()
            form.parse(req,function(err,fields,files){

                fields.title = fields.title[0]
                fields.content = fields.content[0]
                console.log(fields)
                req.params.fields = fields
                req.params.files = files
                resolve()
            })
        }else{
            resolve()
        }
    })
}
