//Utils & constants
var extend = require('util')._extend,
    DIRECTION = {
        "UP": 38,
        "DOWN": 40,
        "LEFT": 37,
        "RIGHT": 39,
    },
    MAP = {WIDTH: 900, HEIGHT: 400},
    VELOCITY = {X: 5, Y:5};

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

            if (isEmpty(player.destination) && i >= 99) { //Moving?
                range = 500;
                player.destination = {
                    x: 5*Math.round(Game.randomInt(0, MAP.WIDTH)/5),
                    y: 5*Math.round(Game.randomInt(0, MAP.HEIGHT)/5)
                }
            }
        }

        if (player.destination) {
            if (player.destination.x > player.position.x) {
                player.velocity.x = VELOCITY.X;
            } else if (player.destination.x < player.position.x) {
                player.velocity.x = -VELOCITY.X;
            } else {
                player.velocity.x = 0;
            }

            if (player.destination.y > player.position.y) {
                player.velocity.y = VELOCITY.Y;
            } else if (player.destination.y < player.position.y) {
                player.velocity.y = -VELOCITY.Y;
            } else {
                player.velocity.y = 0;
            }
        }

        player.position.x += player.velocity.x;
        player.position.y += player.velocity.y;

        //Check direction
        if (player.velocity.x > 0 && player.velocity.y == 0) {
            player.direction = 'e';
        } else if (player.velocity.x < 0 && player.velocity.y == 0) {
            player.direction = 'w';
        } else if (player.velocity.y > 0 && player.velocity.x == 0) {
            player.direction = 's';
        } else if (player.velocity.y < 0 && player.velocity.x == 0) {
            player.direction = 'n';
        } else if (player.velocity.x > 0 && player.velocity.y > 0) {
            player.direction = 'se';
        } else if (player.velocity.x < 0 && player.velocity.y > 0) {
            player.direction = 'sw';
        } else if (player.velocity.x < 0 && player.velocity.y < 0) {
            player.direction = 'nw';
        } else if (player.velocity.x > 0 && player.velocity.y < 0) {
            player.direction = 'ne';
        }

        //Check destination
        if (isAtDestination(player)) {
            player.destination = {};
        }

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
                direction: "s",
                destination: {},
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
            player.name = data.name;
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

        socket.on('player.click', function (data) {
            player.destination = {x: data.x, y: data.y};
        });

        socket.on('game.addRandomPlayer', function () {
            random_player = {
                id: Date.now(),
                socket: null,
                name: "Random player" + (Object.keys(players).length+1),
                direction: "s",
                destination: {},
                position: {
                    x: 5*Math.round(Game.randomInt(MAP.WIDTH/2 - 50, MAP.WIDTH/2 + 50)/5),
                    y: 5*Math.round(Game.randomInt(MAP.HEIGHT/2 - 50, MAP.HEIGHT/2 + 50)/5),
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

        socket.on('game.deleteRandomPlayers', function () {
            for (i in players) {
                if (!players[i].socket) {
                    Game.io.sockets.emit('game.player.disconnect', players[i].id);
                    delete players[i];
                }
            }
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

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function isAtDestination(player) {
    return (!isEmpty(player.destination) && player.destination.x == player.position.x && player.destination.y == player.position.y);
}

module.exports = function(io) {
    Game.start(io);
};
