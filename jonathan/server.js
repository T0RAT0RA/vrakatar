var http = require("http");
var url = require("url");

function start() {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    
    if(pathname == "/submit" && request.method == "POST"){
	   //response.write(generateImage(request));
    generateImage(request);
  }

  console.log("=== " + request.method);
  console.log("Request for " + pathname + " received.");
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World");
  response.end();
}

http.createServer(onRequest).listen(8888);
console.log("Server has started.");
}

function generateImage(request){
  var gm = require('gm');
  //var fs = require('fs');
  //var writeStream = fs.createWriteStream( "test.jpg", { encoding: 'base64' } );


/*gm('_example.jpg')
.resize('200', '200')
.stream(function (err, stdout, stderr) {
  var writeStream = fs.createWriteStream('resized.jpg');
  stdout.pipe(writeStream);
});
*/

  gm('_example.jpg')
  .resize(100, 100)
  .autoOrient()
  .write("test2.jpg", function (err) {
    if (!err) console.log(' hooray! ');
  });

}

start();