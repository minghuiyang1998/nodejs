const url = require('url');
const fs = require('fs');
const ejs = require('ejs')

var handlers={}
handlers['/Form'] = function(request,response){return Form(request,response)}

var route = function(request,response){
    console.log("route")
    if(typeof handlers[url.parse(request.url,true).pathname] != "function") {
        missing(request,response)
    } 
    else{
        handlers[url.parse(request.url,true).pathname](request,response);
    }
}

function Form(request,response){
    console.log("Form")
    if(url.parse(request.url).search == null){
        var path = __dirname+'/Form.html'
        var str = fs.readFileSync(path, 'utf8');
        var formHtml = ejs.render(str,{filename:path})
        response.writeHead(200,{'Content-Type':'text/html'})
        response.end(formHtml)
    }else{
        var params = url.parse(request.url,true).query;
        console.log(params)
        var html = ejs.render('<%for(p in params){%><%=p%>:<%=params[p]%><%}%>',{params:params});
        response.writeHead(200,{'Content-type':'text/html'})
        response.end(html)
    }
}

function missing(request,response){
    response.writeHead(404,{'Content-type':'text/plain'})
    response.write("404 not found")
    response.end()
}

module.exports = route;
