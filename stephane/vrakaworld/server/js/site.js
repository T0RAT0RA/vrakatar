var fs = require('fs');

function main(config) {
    var socketio = require('socket.io'),
        socketioWildcard = require('socket.io-wildcard'),
        server = socketioWildcard(socketio).listen(config.port, {log: false}),
        Types = require("../../shared/js/gametypes"),
        Log = require('log'),
        _ = require('underscore');

    switch(config.debug_level) {
        case "error":
            log = new Log(Log.ERROR); break;
        case "debug":
            log = new Log(Log.DEBUG); break;
        case "info":
            log = new Log(Log.INFO); break;
    };

    log.info("Starting Vrakatar site game server...");

    server.sockets.on("connection", function(socket) {
        socket.on(Types.Messages.INIT, function(data) {
            npc = {
                id: Date.now(),
                name: data.username,
                position: {
                    x: 500,
                    y: 300,
                },
                size: {
                    width: 50,
                    height: 100,
                },
                color: "#00F"
            };
            socket.emit(Types.Messages.SPAWN, npc);
        });
    });

    process.on('uncaughtException', function (e) {
        log.error('uncaughtException: ' + e);
    });
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

var defaultConfigPath = './server/config.site.json';

//Start the server with a config file
getConfigFile(defaultConfigPath, function(defaultConfig) {
    if(defaultConfig) {
        main(defaultConfig);
    } else {
        console.error("Server cannot start without any configuration file.");
        process.exit(1);
    }
});
