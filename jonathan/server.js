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
  //response.write("Hello World");
  response.end();
}

http.createServer(onRequest).listen(8888);
console.log("Server has started.");
}

var character = "character.png",
character_final = "character.final.png";

function generateImage(request){
  var fs = require("fs");
  var gm = require('gm');

  gm(character)
  .crop(32, 32, 0, 32)
  .write("1"+character_final, function (err) {
    if (err) {
      console.log(err);
    } 
  });

  gm(character)
  .crop(32, 32, 3*32, 32)
  .write("2"+character_final, function (err) {
    if (err) {
      console.log(err);
    } 
  });

  var waitForTempImgs = setInterval(function(){
   if(fs.existsSync("1"+character_final) && fs.existsSync("2"+character_final)){
    gm()
        .in('-page', '+0+0')  // Custom place for each of the images
        .in("1"+character_final)
        .in('-page', '+0+0')
        .in("2"+character_final)
        .mosaic()
        .write(character_final, function (err) {
          if (err) console.log(err);
        });

        clearInterval(waitForTempImgs);
      }
    }, 100);

}
start();