var fs = require('fs');

function main(config) {
    var socketio = require('socket.io'),
        socketioWildcard = require('socket.io-wildcard'),
        server = socketioWildcard(socketio).listen(config.port, {log: false}),
        WorldServer = require("./worldserver"),
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
        world = worlds[0];
        new Player({
            socket: socket,
            world: world,
            position: {
                x: 100,
                y: 100,
            }
        });
    });

    _.each(config.worlds, function(world_config, id) {
        var world = new WorldServer('world_'+ (id), world_config.nb_players, server);
        world.run(world_config.map_filepath);
        worlds.push(world);
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

var defaultConfigPath = './server/config.json';

//Start the server with a config file
getConfigFile(defaultConfigPath, function(defaultConfig) {
    if(defaultConfig) {
        main(defaultConfig);
    } else {
        console.error("Server cannot start without any configuration file.");
        process.exit(1);
    }
});
