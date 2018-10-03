const http = require('http');
const url = require('url');
const fs = require('fs');

const proxy = http.createServer(function(request,response){
    var pathname = url.parse(request.url).pathname
    setTimeout(()=>{
        if(pathname === "/Form"){
            if(url.parse(request.url).search == null){
                response.writeHead(200,{'Content-Type':'text/html'})
                fs.readFile('./Form.html','utf-8',function(err,data){
                    response.end(data)
                })
            }else{
               Form(request,response)
            }
        }
        else{
            console.log("not Form")
            response.writeHead(404,{'Content-type':'text/plain'})
            response.write("404 not found")
            response.end()
        }
    },5000)
}).listen(8080,'127.0.0.1')

function Form(request,response){
    console.log("Form")
    response.writeHead(200,{'Content-type':'text/plain'})
    var params = url.parse(request.url,true).query;
    response.write("content: "+params.content)
    response.end()
}
