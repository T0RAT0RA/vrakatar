var cls = require("./lib/class"),
    _ = require("underscore"),
    Log = require('log'),
    Entity = require('./entity'),
    Player = require('./player'),
    Npc = require('./npc'),
    Types = require("../../shared/js/gametypes");

// ======= GAME SERVER ========

module.exports = World = cls.Class.extend({
    init: function(id, maxPlayers, websocketServer, config) {
        var self = this;

        this.id = id;
        this.maxPlayers = maxPlayers;
        this.server = websocketServer;
        this.ups = 20;

        this.map = null;

        this.allowDiagonals = false;
        this.entities   = {};
        this.npcs       = {};
        this.players    = {};

        this.playerCount = 0;

        this.onPlayerConnect();

        this.onPlayerEnter(function(player) {
            log.debug("Player " + player.name + " connected. " + player.id);

            player.onExit(function() {
                log.info(player.name + " has left the game.");

                self.removePlayer(player);
                self.server.sockets.emit(Types.Messages.MESSAGE, player.name + " has left the game.");

                if(self.removed_callback) {
                    self.removed_callback();
                }
            });

            //Send each existing entity to the player game
            _.each(self.entities, function(entity){
                player.send(Types.Messages.SPAWN, self.getCleanEntity(entity));
            });
            self.addPlayer(player);
            player.hasEnteredGame = true;
            self.server.sockets.emit(Types.Messages.MESSAGE, "Player " + player.name + " has joined the game.");

            if(self.added_callback) {
                self.added_callback();
            }
        });

        log.info(""+this.id+" created (capacity: "+this.maxPlayers+" players).");
    },

    onPlayerConnect: function(callback) {
        this.connect_callback = callback;
    },

    onPlayerDisconnect: function(callback) {
        this.disconnect_callback = callback;
    },

    onPlayerEnter: function(callback) {
        this.enter_callback = callback;
    },

    onPlayerAdded: function(callback) {
        this.added_callback = callback;
    },

    onPlayerRemoved: function(callback) {
        this.removed_callback = callback;
    },

    run: function(mapFilePath) {
        var self = this;

        setInterval(function() {
            //log.debug(self.id + " running... ");
            //log.debug("entities: ", _.pluck(self.entities, 'name'));
            //log.debug("players: ", _.pluck(self.players, 'name'));
            //log.debug("npcs: ", _.pluck(self.npcs, 'name'));
            self.updatePositions();
            self.broadcast(Types.Messages.STATE, self.getState());
        }, 1000 / this.ups);

        log.info(""+this.id+" running...");
    },

    updatePositions: function() {
        _.each(this.entities, function(entity) {
            //Move NPC randomly
            if (entity.type == "npc") {
                i = _.random(0, 100);

                if (_.isEmpty(entity.destination) && i >= 99) { //Moving?
                    range = 500;
                    entity.destination = {
                        x: _.random(0, range),
                        y: _.random(0, range)
                    }
                }
            }

            if (entity.destination) {
                var offset = {
                    x: Types.Velocity.X,
                    y: Types.Velocity.Y,
                };

                if (entity.position.x < entity.destination.x - offset.x) {
                    entity.velocity.x = Types.Velocity.X;
                } else if (entity.position.x > entity.destination.x + offset.x) {
                    entity.velocity.x = -Types.Velocity.X;
                } else {
                    entity.velocity.x = 0;
                }


                if (entity.position.y < entity.destination.y - offset.y) {
                    entity.velocity.y = Types.Velocity.Y;
                } else if (entity.position.y > entity.destination.y + offset.y) {
                    entity.velocity.y = -Types.Velocity.Y;
                } else {
                    entity.velocity.y = 0;
                }

                //If player can't go in diagonals, first finish movement on the x axis
                if (!this.allowDiagonals && entity.velocity.x) {
                    entity.velocity.y = 0;
                }
            }

            entity.position.x += entity.velocity.x;
            entity.position.y += entity.velocity.y;

            //Check direction
            if (entity.velocity.x > 0 && entity.velocity.y == 0) {
                entity.direction = 'e';
            } else if (entity.velocity.x < 0 && entity.velocity.y == 0) {
                entity.direction = 'w';
            } else if (entity.velocity.y > 0 && entity.velocity.x == 0) {
                entity.direction = 's';
            } else if (entity.velocity.y < 0 && entity.velocity.x == 0) {
                entity.direction = 'n';
            } else if (entity.velocity.x > 0 && entity.velocity.y > 0) {
                entity.direction = 'se';
            } else if (entity.velocity.x < 0 && entity.velocity.y > 0) {
                entity.direction = 'sw';
            } else if (entity.velocity.x < 0 && entity.velocity.y < 0) {
                entity.direction = 'nw';
            } else if (entity.velocity.x > 0 && entity.velocity.y < 0) {
                entity.direction = 'ne';
            }

            //Check destination
            if (entity.isAtDestination()) {
                entity.destination = {};
            }
        });
    },

    addEntity: function(entity) {
        this.entities[entity.id] = entity;
        this.server.sockets.emit(Types.Messages.SPAWN, this.getCleanEntity(entity));
    },

    removeEntity: function(entity) {
        if(entity.id in this.entities) {
            delete this.entities[entity.id];
        }
        entity.destroy();

        this.server.sockets.emit(Types.Messages.DESPAWN, {id: entity.id});
    },

    addPlayer: function(player) {
        this.addEntity(player);
        this.players[player.id] = player;
    },

    removePlayer: function(player) {
        //player.broadcast(player.despawn());
        this.removeEntity(player);
        delete this.players[player.id];
    },

    addNpc: function() {
        var npc = new Npc(Date.now(), {
                position: {
                    x: _.random(50, 600),
                    y: _.random(50, 400),
                },
                size: {
                    width: _.random(20, 40),
                    height: _.random(20, 40),
                }
            });

        this.addEntity(npc);
        this.npcs[npc.id] = npc;

        //temporary message
        this.server.sockets.emit(Types.Messages.MESSAGE, "Npc " + npc.name + " has joined the game.");

        return npc;
    },

    removeNpc: function(npc) {
        this.removeEntity(npc);
        delete this.npcs[npc.id];

        //temporary message
        this.server.sockets.emit(Types.Messages.MESSAGE, "Npc " + npc.name + " has left the game.");
    },

    removeNpcs: function() {
        var self = this;

        _.each(this.npcs, function(npc){
            self.removeNpc(npc);
        });
    },

    getEntitiesByType: function() {
        return _.groupBy(this.entities, function(entity) {
          return entity.type;
        });
    },

    broadcast: function(type, message) {
        this.server.sockets.emit(type, message);
    },

    getCleanEntity: function(entity) {
        return _.omit(entity, 'world', 'socket', 'hasEnteredGame');
    },

    getState: function() {
        var self = this,
            filtered_players = _.map(this.entities, function(entity){ return self.getCleanEntity(entity); });
        return {
            server_time: new Date().toLocaleTimeString(),
            entities_count: Object.keys(this.players).length,
            entities: filtered_players,
        }
    }
});
