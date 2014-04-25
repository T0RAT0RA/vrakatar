var cls = require("./lib/class"),
    _ = require("underscore"),
    Types = require("../../shared/js/gametypes");

module.exports = Player = Class.extend({
    init: function(config) {
        var self = this;

        this.socket = config.socket;

        this._super(this.socket.id, "player", config);

        this.hasEnteredGame = false;

        this.socket.on("*", function(event) {
            var action  = event.name,
                data    = event.args[0];

            if (Types.Messages.INIT == action) {
                self.name = data.name;

                self.send(Types.Messages.INIT, {id: self.id})

                self.world.addPlayer(self);
                self.world.enter_callback(self);

                self.hasEnteredGame = true;
            }
            else if (Types.Messages.DISCONNECT == action) {
                if(self.exit_callback) {
                    self.exit_callback();
                }
            }
            else if (Types.Messages.CHAT == action) {
                self.world.broadcast(Types.Messages.CHAT, {id: self.id, name: self.name, message: data});
            }
            else if (Types.Messages.MOVE == action) {
                self.destination.x = data.x;
                self.destination.y = data.y;
            }
            else if (Types.Messages.ADD_NPC == action) {
                self.world.addNpc();
            }
            else if (Types.Messages.REMOVE_NPCS == action) {
                self.world.removeNpcs();
            }
        });
    },

    onExit: function(callback) {
        this.exit_callback = callback;
    },

    send: function(name, message) {
        this.socket.emit(name, message);
    }
});
