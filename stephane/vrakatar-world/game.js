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

        //Check world boundaries
        if (player.position.x + player.width < 0) {
            player.position.x = MAP.WIDTH;
        } else if (player.position.x > MAP.WIDTH) {
            player.position.x = 0 - player.width;
        }
        if (player.position.y + player.height < 0) {
            player.position.y = MAP.HEIGHT;
        } else if (player.position.y > MAP.HEIGHT) {
            player.position.y = 0 - player.height;
        }

        //Check actions
        if (player.action) {
            switch(player.action.type) {
                case "blink":
                    player.color = "#" + Game.randomInt(0, 9) + Game.randomInt(0, 9) + Game.randomInt(0, 9);
                    if (Date.now() - player.action.started_at >= 5000) {
                        delete player.action;
                        player.color = "#000";
                    }
                break;
                case "hi":
                    player.talk = "Salut!";
                    if (Date.now() - player.action.started_at >= 5000) {
                        player.talk = "";
                        delete player.action;
                    }
                break;
                default: break;
            }
        }
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
                    x: Math.round(MAP.WIDTH/2),
                    y: Math.round(MAP.HEIGHT/2),
                },
                color: "#000",
                width: 30,
                height: 30,
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
                    player.velocity.x = -VELOCITY.X;
                break;
                case DIRECTION["UP"]:
                    player.velocity.y = -VELOCITY.Y;
                break;
                case DIRECTION["RIGHT"]:
                    player.velocity.x = VELOCITY.X;
                break;
                case DIRECTION["DOWN"]:
                    player.velocity.y = VELOCITY.Y;
                break;
                default: break;
            }
        });
        socket.on('player.keyup', function (direction) {
            switch(direction) {
                case DIRECTION["LEFT"]:
                case DIRECTION["RIGHT"]:
                    player.velocity.x = 0;
                break;
                case DIRECTION["UP"]:
                case DIRECTION["DOWN"]:
                    player.velocity.y = 0;
                break;
                default: break;
            }
        });

        socket.on('game.addRandomPlayer', function () {
            random_player = {
                id: Date.now(),
                socket: null,
                name: "Random player" + (Object.keys(players).length+1),
                position: {
                    x: Game.randomInt(50, MAP.WIDTH-50),
                    y: Game.randomInt(50, MAP.HEIGHT-50),
                },
                color: "#A00",
                width: Game.randomInt(20, 40),
                height: Game.randomInt(20, 40),
                velocity: {
                    x: 0,
                    y: 0,
                },
            };
            players[random_player.id] = random_player;
        });

        socket.on('player.action', function (action) {
            players[player.id].action = {
                type: action,
                started_at: Date.now()
            };
        });

        socket.on('disconnect', function (socket) {
            delete players[player.id];
            Game.io.sockets.emit('game.player.disconnect', player.id);
        });
    });
}

Game.getState = function() {
    return {
        server_time: new Date().toLocaleTimeString(),
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
