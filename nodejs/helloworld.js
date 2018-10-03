const http = require('http');
const router = require('./route')

const proxy = http.createServer(function(request,response){
    router(request,response)
}).listen(8080,'127.0.0.1')


