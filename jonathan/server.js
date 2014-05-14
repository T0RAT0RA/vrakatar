var http = require("http");
var url = require("url");
  var fs = require("fs");
  var gm = require('gm');

function start() {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    
    if(pathname == "/submit" && request.method == "POST"){
	   //response.write(generateImage(request));
     generateImage(request);
   }

     if(pathname == "/superImpose" && request.method == "POST"){
      //TODO!!!!
     // Hard coded params: must figure out how to send it in the CURL
     superImpose("character.png", 0, 4*32, "character.final.png");
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
  /*
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
  */

  gm(character)
  .crop(3*32, 4*32, 0, 0)
  .write("1"+character_final, function (err) {
    if (err) {
      console.log(err);
    } 
  });

  gm(character)
  .crop(3*32, 4*32, 3*32, 0)
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

/*
function extractTempImage(length,hight,posX,posY){
  // create the temporary image
  return filename
}
*/

function superImpose(gridFile, posX, posY, target){
  console.log("hey wtf");
  var tempImg = "temp1.png";
    gm(gridFile)
  .crop(3*32, 4*32, posX, posY)
  .write(tempImg, function (err) {
    if (err) {
      console.log(err);
    } 
  });

    var waitForTempImgs = setInterval(function(){
   if(fs.existsSync(tempImg) && fs.existsSync(target)){
    console.log("hey wtf2");
    gm()
        .in('-page', '+0+0')  // Custom place for each of the images
        .in(target)
        .in('-page', '+0+0')
        .in(tempImg)
        .mosaic()
        .write("blah.png", function (err) {
          if (err) console.log(err);
        });

        clearInterval(waitForTempImgs);
      }
    }, 100);
}
start();