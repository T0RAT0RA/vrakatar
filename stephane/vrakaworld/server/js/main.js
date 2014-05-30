var http    = require("http"),
    url     = require("url"),
    fs      = require("fs"),
    gm      = require('gm').subClass({ imageMagick: true });

function main(config) {
    var socketio = require('socket.io'),
        socketioWildcard = require('socket.io-wildcard'),
        server = socketioWildcard(socketio).listen(config.port, {log: false}),
        WorldServer = require("./worldserver"),
        Types = require("../../shared/js/gametypes");
        Log = require('log'),
        _ = require('underscore'),
        worlds = [];

    switch(config.debug_level) {
        case "error":
            log = new Log(Log.ERROR); break;
        case "debug":
            log = new Log(Log.DEBUG); break;
        case "info":
            log = new Log(Log.INFO); break;
    };

    log.info("Starting Vrakatar world game server...");

    server.sockets.on("connection", function(socket) {
        socket.on(Types.Messages.ENTERWORLD, function(data) {
            if (worlds["world_" + data.world]) {
                world = worlds["world_" + data.world]
            } else {
                console.log("Wordl world_" + data.world + "doesn't exist.")
                world = worlds["world_main"];
            }

            new Player({
                socket: socket,
                world: world
            });
        });
    });

    //Read the world maps folder
    var files = fs.readdirSync(config.worldsFolder);
    _.each(files, function(file) {
        getConfigFile(config.worldsFolder + file, function(world_config){
            var world = new WorldServer('world_'+ (world_config.id), world_config.nb_players, server, {map: world_config.map});
            world.run();
            worlds[world.id] = world;
        });
    });
    /*
    process.on('uncaughtException', function (e) {
        log.error('uncaughtException: ' + e);
    });
    */
}

function getConfigFile(path, callback) {
    fs.readFile(path, 'utf8', function(err, json_string) {
        if(err) {
            console.error("Could not open config file:", err.path);
            callback(null);
        } else {
            callback(JSON.parse(json_string));
        }
    });
}

var defaultConfigPath = './server/config.worlds.json';

//Start the server with a config file
getConfigFile(defaultConfigPath, function(defaultConfig) {
    if(defaultConfig) {
        main(defaultConfig);
    } else {
        console.error("Server cannot start without any configuration file.");
        process.exit(1);
    }
});

/*************************************************/
/* AVATAR GENERATION: move this code in a module */
/*************************************************/
http.createServer(onRequest).listen(8888);
function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname,
        headers = {},
        json_response = {};


    if (pathname == "/submit" && request.method == "POST") {
        var postData = '';

        request.on('data', function(chunk) {
            postData += chunk.toString();
        });

        request.on('end', function(chunk) {
            postData = JSON.parse(postData);
            if (postData.username) {
                generateImage(postData);
            }
        });
    }

    // IE8 does not allow domains to be specified, just the *
    // headers["Access-Control-Allow-Origin"] = req.headers.origin;
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = false;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
    response.writeHead(200, headers);
    response.write(JSON.stringify(json_response));
    response.end();
}

function generateImage(data) {
    var imgFolder   = "./client/img/",
        avatar      = imgFolder + "character.png",
        avatarSize  = 32;
        spriteSize  = {width: 3*avatarSize, height: 4*avatarSize}
        fileName    = imgFolder+"avatars/"+data.username;

    //Add the default body image
    data.avatar.unshift([0,0]);

    for (var i in data.avatar) {
        keyValue = data.avatar[i];
        gm(avatar)
        .crop(spriteSize.width, spriteSize.height, keyValue[0]*3*avatarSize, keyValue[1]*4*avatarSize)
        .write(fileName+"."+i+".tmp", function (err) {
            if (err) { console.log(err); }
        });
    }

    var waitForTempImgs = setInterval(function(){
        for (var i in data.avatar) {
            if (!fs.existsSync(fileName+"."+i+".tmp")) { return false; }
        }

        var processedImage = gm();
        for (var i in data.avatar) {
            processedImage.in('-page', '+0+0')
            .in(fileName+"."+i+".tmp");
        }

        processedImage.mosaic()
        .write(fileName+".png", function (err) {
            if (err) { console.log(err); }
            if (!data.keepTmpFiles){
                for (var i in data.avatar) {
                    fs.unlink(fileName+"."+i+".tmp");
                }
            }

        });

        clearInterval(waitForTempImgs);
    }, 100);

}
