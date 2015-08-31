//外部ファイルの読み込み（ベース処理）
//http://qiita.com/morou/items/6a1b9d09a8500f2f62e4「node.jsで動作するシンプルなWebサーバ」
//POSTデータの扱い
//http://qiita.com/katsuakikon/items/94c38245f6ebfdd444d0「Node.jsのWebサーバ基本処理」

var gulp = require('gulp');
var http = require("http"),
    url  = require("url"),
    path = require("path"),
    fs   = require("fs");
var querystring = require("querystring");

gulp.task('default',function(){

   var root='./';

	  //
	  // status code message map
	  //
	  var message = {
	    200: "OK",
	    404: "Not Found",
	    500: "Internal Server Error",
	    501: "Note Implemented"
	  };

	  //
	  // mime type map
	  //
	  var mime = {
	    ".html": "text/html",
	    ".css":  "text/css",
	    ".js":   "application/javascript",
	    ".png":  "image/png",
	    ".jpg":  "image/jpeg",
	    ".gif":  "image/gif",
	    ".txt":  "text/plain"
	  };

	  //
	  // send requested file
	  //
	  function sendFile(req, res, filePath) {

	    var file = fs.createReadStream(filePath);
	    file.on("readable", function() {
				console.log("<- " +  mime[path.extname(filePath)] || "text/plain");
	    });

	    file.on("data", function(data) {
				res.writeHead(200, {"Content-Type": mime[path.extname(filePath)] || "text/plain"});
	      res.write(data);
				console.log("<- " +  data);
	    });

	    file.on("end", function() {
	      res.end();
	      console.log("<- " + message[200] + ": " + req.method + " " + req.url);
	    });

	    file.on("error", function(err) {
	      sendError(req, res, 500);
	    });
	  }

	  //
	  // send error status
	  //
	  function sendError(req, res, statusCode) {
	    res.writeHead(statusCode, {"Content-Type": "text/html"});
	    res.write("<!DOCTYPE html><html><body><h1>" + message[statusCode] + "</h1></body></html>");
	    res.end();
	    console.log("<- " + message[statusCode] + ": " + req.method + " " + req.url);
	  }

	  //
	  // request handler
	  //
	  function handleRequest(req, res, filePath) {

	    fs.stat(filePath, function(err, stats) {
	      if (err) {
	        if ((/ENOENT/).test(err.message)) return sendError(req, res, 404);
	        else return sendError(req, res, 500);
	      }

	      if (stats.isDirectory())
	        return handleRequest(req, res, path.join(filePath, "index.html")); // try to handle request with index.html file
	      else
	        return sendFile(req, res, filePath);
	    });
	  }

http.createServer(function (req, res) {
			if (req.method === "GET")
			{
				var pathName = url.parse(req.url).pathname;
				console.log("-> " + req.method + " " + pathName);
				handleRequest(req, res, path.join(root, pathName));
			}else{
				console.log("-> " + req.method);

				var postData = "";

				req.on("data", function(chunk) {
					console.log("-> " + "data" + " " + chunk);
						postData += chunk;
				});
				req.on("end", function() {
						res.writeHead(200, {"Content-Type": "application/json"});
						res.write(JSON.stringify(querystring.parse(postData)));
						res.end();
				});
			}
	}).listen(8000, 'localhost');
	console.log('Server running at http://localhost:8000/');
});
