const url = require('url');
const fs = require('fs');
const ejs = require('ejs')

const render(filepath, data) {
    var str = fs.readFileSync(path.resolve('./views', filepath), 'utf8');
    return ejs.render(str, data)
}

var handlers={
    '/form': function(req,res) {
        console.log("Form")
        if(url.parse(request.url).search == null){
            var html = render('new-form.html',).
            res.writeHead(200,{'Content-type':'text/html'})
            res.end(html)
        }else{
            var params = url.parse(request.url,true).query;
            var html = render('result.html', params).
            res.writeHead(200,{'Content-type':'text/html'})
            res.end(html)
        }
    },
    '/hello-world': function() {
    },
    '*': function(req, res) {
        render('404.html')
        res.writeHead(404,{'Content-type':'text/plain'})

    }
}


module.exports = function(request,response){
    console.log("route")
    if(typeof handlers[url.parse(request.url,true).pathname] != "function") {
        missing(request,response)
    } 
    else{
        handlers[url.parse(request.url,true).pathname](request,response);
    }
}

