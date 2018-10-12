const url = require('url');
const fs = require('fs');
const path = require('path')
const ejs = require('ejs')
const bodyparse = require("./body-parse")

function render(filePath, data) {
    var str = fs.readFileSync(path.resolve('./views', filePath), 'utf-8')
    var html = ejs.render(str, data)
    return html
}


function route(req, res) {
    req.params = {}
    req.params.setId = Date.now().toString()
    req.params.queryId = url.parse(req.url, true).query.id

    var precast = bodyparse(req)
    precast.then(next)

    function next() {//上下文req
        var pathname = url.parse(req.url, true).pathname
        console.log(pathname)
        if (/^\/article\/(.+)\/edit$/.test(pathname)) {
            handlers["GET /article/:articleId/edit"](req, res)
        } else if (/^\/image\/(.+)$/.test(pathname)) {
            handlers["GET /image/:imageId"](req, res)
        }
        else {
            var distinguish = req.method + ' ' + pathname
            if (typeof handlers[distinguish] === "function") {
                handlers[distinguish](req, res)
            } else {
                handlers["GET *"](req, res)
            }
        }
    }
}

var handlers = {
    'GET /article/new': function (req, res) {
        console.log("new")
        var html = render('new-article.html')
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(html)
    },
    'GET /article/:articleId/edit': function (req, res) {
        console.log("edit")
        var pathname = url.parse(req.url, true).pathname
        var id = /^\/article\/(.+)\/edit$/.exec(pathname)[1]
        var article = fs.readFileSync(path.resolve('./data/articles', id), 'utf-8')
        var params = JSON.parse(article)
        params['id'] = id

        var html = render('modify-article.html', { params: params })
        res.writeHead(200, { "Content-type": "text/html" })
        res.end(html)
    },
    'GET /article': function (req, res) {
        console.log("detail")
        var id = req.params.queryId
        var article = fs.readFileSync(path.resolve('./data/articles', id), 'utf-8')
        var article_params = JSON.parse(article)

        if (Object.keys(article_params).indexOf('file') != -1) {
            article_params.file = "http://127.0.0.1:8080/image/" + article_params.file
        }
        console.log('-----------------')

        var html = render('show-article.html', { params: article_params });
        res.writeHead(200, { 'Content-type': 'text/html' })
        res.end(html)
    },
    'GET /image/:imageId': function (req, res) {
        console.log("image")
        var pathname = url.parse(req.url, true).pathname
        var name = /^\/image\/(.+)$/.exec(pathname)[1]
        console.log(name)
        var content = fs.readFileSync(path.resolve('./data', name), 'binary')
        res.writeHead(200, { 'Content-type': 'image/png' })
        res.write(content, 'binary')
        res.end()

    },
    'GET /articles': function (req, res) {
        console.log("list")

        var articles = fs.readdirSync("./data/articles")
        var html = render('article-list.html', { articles: articles })
        res.writeHead(200, { 'Content-type': 'text/html' })
        res.end(html)
    },
    'GET /hello-world': function (req, res) {
        console.log("helloworld")
        res.writeHead(200, { 'Content-type': 'text/html' })
        var html = render('hello-world.html')
        res.end(html)
    },
    "GET *": function (req, res) {
        console.log("404")
        res.writeHead(404, { 'Content-type': 'text/html' })
        var html = render('404.html')
        res.end(html)
    },
    "POST /articles": function (req, res) {
        console.log("Post")
        var id = req.params.setId
        var data = {}
        data.title = req.params.fields.title
        data.content = req.params.fields.content

        if (Object.keys(req.params).indexOf("files") != -1) {
            var fileName = id + '_poster'
            data.file = fileName

            var filePath = req.params.files.image[0]['path']
            var file = fs.readFileSync(filePath)
            fs.writeFileSync(path.resolve('./data', fileName), file)
        }

        fs.writeFileSync(path.resolve('./data/articles', id), JSON.stringify(data), 'utf-8')
        res.writeHead(302, { "Location": 'http://127.0.0.1:8080/article?id=' + id })
        res.end()
    },
    "DELETE /article": function (req, res) {
        console.log("delete")
        var id = req.params.queryId
        var file = fs.readFileSync(path.resolve('./data/articles', id))
        var params = JSON.parse(file)

        if (Object.keys(params).indexOf('file') != -1) {
            fs.unlinkSync(path.resolve('./data', params.file))
        }

        fs.unlinkSync(path.resolve('./data/articles', id))

        if (req.headers.accept === "text/plain") {
            res.writeHead(200, { 'Content-Type': 'text/plain' })
            res.end("success")
        }
    },
    "PUT /article": function (req, res) {
        console.log("PUT")
        var id = req.params.queryId
        var data = {}
        data.title = req.params.fields.title
        data.content = req.params.fields.content
        var article = fs.readFileSync(path.resolve('./data/articles', id), 'utf-8')
        var article_params = JSON.parse(article)
        for (var item in data) {
            if (item != 'file' && data[item].length != 0 && article_params[item] != data[item]) {
                article_params[item] = data[item]
            }
        }

        if (Object.keys(req.params).indexOf("files") != -1) {
            var fileName = id + '_poster'
            data.file = fileName
            var filePath = req.params.files.image[0]['path']
            var file = fs.readFileSync(filePath)

            if (file.length != 0) {
                fs.writeFileSync(path.resolve('./data', fileName), file)
                fs.unlink(path.resolve('./data', article_params.file))
                article_params.file = data.file
            }
        }

        fs.writeFileSync(path.resolve('./data/articles', id), JSON.stringify(article_params), 'utf-8')
        if (req.headers.accept === "text/html") {
            res.writeHead(200, { "Content-type": "text/html" })
            html = 'http://127.0.0.1:8080/article?id=' + id
            res.end(html)
        }
    }

}

module.exports = function (req, res) {
    route(req, res)
}
