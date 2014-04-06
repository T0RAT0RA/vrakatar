//Utils & constants
var extend = require('util')._extend,
    DIRECTION = {
        "UP": 38,
        "DOWN": 40,
        "LEFT": 37,
        "RIGHT": 39,
    },
    MAP = {WIDTH: 1000, HEIGHT: 400},
    VELOCITY = {X: 10, Y:10};

//Init game
var Game = {},
    players = {};

Game.init = function() {
};

Game.update = function() {
    //Update players pos
    for (i in players) {
        player = players[i];

        //If player is not human (no socket associate)
        //Move it randomly
        if (!player.socket) {
            i = Game.randomInt(0, 100);

            if (i >= 90) { //Moving?
                player.velocity.x = Game.randomInt(-VELOCITY.X, VELOCITY.X);
                player.velocity.y = Game.randomInt(-VELOCITY.Y, VELOCITY.Y);
            } else if ((i >= 70)) { //Stop?
                player.velocity.x = player.velocity.y = 0;
            }
        }

        player.position.x += player.velocity.x;
        player.position.y += player.velocity.y;
    }

    Game.io.sockets.emit('game.state', Game.getState());
};

Game.stop = function() {
    clearInterval(Game._intervalId);
}

Game.start = function(io) {
    Game.io = io;
    Game._intervalId = setInterval(Game.update, 50);

    io.sockets.on('connection', function (socket) {
        var player = {
                id: Date.now(),
                socket: socket,
                name: "player" + (Object.keys(players).length+1),
                position: {
                    x: 0,
                    y: 0,
                },
                velocity: {
                    x: 0,
                    y: 0,
                },
            };
        players[player.id] = player;

        socket.emit('game.init', {
            MAP: MAP,
            DIRECTION: DIRECTION,
            player: {
                id: player.id
            }
        });

        socket.on('player.name', function (data) {
            players[player.id].name = data.name;
        });

        socket.on('player.keydown', function (direction) {
            switch(direction) {
                case DIRECTION["LEFT"]:
                    player.velocity.y = -VELOCITY.Y;
                break;
                case DIRECTION["UP"]:
                    player.velocity.x = -VELOCITY.X;
                break;
                case DIRECTION["RIGHT"]:
                    player.velocity.y = VELOCITY.Y;
                break;
                case DIRECTION["DOWN"]:
                    player.velocity.x = VELOCITY.X;
                break;
                default:
            }
        });
        socket.on('player.keyup', function (direction) {
            switch(direction) {
                case DIRECTION["LEFT"]:
                    player.velocity.y = 0;
                break;
                case DIRECTION["UP"]:
                    player.velocity.x = 0;
                break;
                default:
                case DIRECTION["RIGHT"]:
                    player.velocity.y = 0;
                break;
                case DIRECTION["DOWN"]:
                    player.velocity.x = 0;
                break;
            }
        });

        socket.on('game.addRandomPlayer', function () {
            random_player = {
                id: Date.now(),
                socket: null,
                name: "Random player" + (Object.keys(players).length+1),
                position: {
                    x: Game.randomInt(0, MAP.HEIGHT),
                    y: Game.randomInt(0, MAP.WIDTH),
                },
                velocity: {
                    x: 0,
                    y: 0,
                },
            };
            players[random_player.id] = random_player;
        });

        socket.on('disconnect', function (socket) {
            delete players[player.id];
            Game.io.sockets.emit('game.player.disconnect', player.id);
        });
    });
}

Game.getState = function() {
    return {
        status: Game._intervalId? "running" : "stopped",
        players_count: Object.keys(players).length,
        players: Game.getPlayers(),
    }
};

Game.getPlayers = function(id) {
    var data_players = [];

    for (i in players) {
        var player = extend({}, players[i]);
        delete player.socket;

        if (id == i) { return player; }
        data_players.push(player);
    }

    return data_players;
}

Game.randomInt = function(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

module.exports = function(io) {
    Game.start(io);
};
