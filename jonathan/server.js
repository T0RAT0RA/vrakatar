var http    = require("http"),
    url     = require("url"),
    fs      = require("fs"),
    gm      = require('gm');

(function start() {
    function onRequest(request, response) {
        var pathname = url.parse(request.url).pathname;

        if(pathname == "/submit" && request.method == "POST"){
            var postData = '';

            request.on('data', function(chunk) {
              postData += chunk.toString();
            });

            request.on('end', function(chunk) {
                postData = JSON.parse(postData);
                generateImage(postData);
            });
        }

        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end();
    }

    http.createServer(onRequest).listen(8888);
    console.log("Server has started.");
})();

var avatar      = "avatar.png",
    avatarSize  = 32;
    spriteSize  = {width: 3*avatarSize, height: 4*avatarSize};

function generateImage(data) {
    gm(avatar)
    .crop(spriteSize.width, spriteSize.height, 0, 0)
    .write(data.username+".tmp", function (err) {
        if (err) {
            console.log(err);
        } 
    });

    for (var i in data.avatar) {
        keyValue = data.avatar[i];
        gm(avatar)
        .crop(spriteSize.width, spriteSize.height, keyValue[0]*3*avatarSize, keyValue[1]*4*avatarSize)
        .write(data.username+"."+i+".tmp", function (err) {
            if (err) {
                console.log(err);
            } 
        });
    }

    var waitForTempImgs = setInterval(function(){
        for (var i in data.avatar) {
            if (!fs.existsSync(data.username+"."+i+".tmp")) { return false; }
        }

        var processedImage = gm()
            .in('-page', '+0+0')
            .in(data.username+".tmp");

        for (var i in data.avatar) {
            processedImage.in('-page', '+0+0')
            .in(data.username+"."+i+".tmp");
        }

        processedImage.mosaic()
        .write(data.username+".png", function (err) {
            if (err) {
                console.log(err);
            } 
            fs.unlink(data.username+".tmp");
            for (var i in data.avatar) {
                fs.unlink(data.username+"."+i+".tmp");
            }
        });

        clearInterval(waitForTempImgs);
    }, 100);

}