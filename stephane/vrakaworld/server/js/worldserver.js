
var cls = require("./lib/class"),
    _ = require("underscore"),
    Log = require('log'),
    Player = require('./player');

// ======= GAME SERVER ========

module.exports = World = cls.Class.extend({
    init: function(id, maxPlayers, websocketServer) {
        var self = this;

        this.id = id;
        this.maxPlayers = maxPlayers;
        this.server = websocketServer;
        this.ups = 1;

        this.map = null;

        this.players = {};

        this.playerCount = 0;

        this.onPlayerConnect(function(player) {
            log.debug("Player " + player.id + " connected.");
            self.players[player.id] = player;

            player.onExit(function() {
                log.info(player.name + " has left the game.");
                self.removePlayer(player);
                self.decrementPlayerCount();

                if(self.removed_callback) {
                    self.removed_callback();
                }
            });
        });
    },

    onPlayerConnect: function(callback) {
        this.connect_callback = callback;
    },

    onPlayerDisconnect: function(callback) {
        this.disconnect_callback = callback;
    },

    run: function(mapFilePath) {
        var self = this;

        setInterval(function() {
            log.debug(self.id + " running... " + _.keys(self.players).length + " players");
        }, 1000 / this.ups);

        log.info(""+this.id+" created (capacity: "+this.maxPlayers+" players).");
    },

    addPlayer: function(player) {
        this.players[player.id] = player;
        log.info("Added player : " + player.id);
    }
});
