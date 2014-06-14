var cls = require("./lib/class"),
    _ = require("underscore"),
    fs = require('fs'),
    Types = require("../../shared/js/gametypes"),
    avatarsFolder = "client/img/avatars/";

module.exports = Player = Class.extend({
    init: function(config) {
        var self = this;

        this.socket = config.socket;

        this._super(this.socket.id, "player", "player", config);

        this.sprite = "default.png";
        this.action = {};
        this.hasEnteredGame = false;
        this.actionsAvailable = [Types.Actions.IDEA, Types.Actions.CALL_JACK_BAUER];

        this.socket.on("disconnect", function() {
            if(self.exit_callback) {
                self.exit_callback();
            }
        });
        this.socket.on("*", function(event) {
            var action  = event.name,
                data    = event.args[0];

            if (Types.Messages.INIT == action) {
                self.name = data.name;

                if (fs.existsSync(avatarsFolder + self.formatUsername(data.name) + ".png")) {
                    self.sprite = self.formatUsername(data.name) + ".png";
                }

                if (self.isAdmin()) {
                    self.actionsAvailable.push(Types.Actions.ADD_NPC);
                    self.actionsAvailable.push(Types.Actions.REMOVE_NPCS);
                }

                self.world.enter_callback(self);
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
            else if (Types.Messages.ACTION == action) {
                if (self.hasAction(data.id)) {
                    if (data.id == Types.Actions.ADD_NPC.id) { self.world.addNpc(); }
                    if (data.id == Types.Actions.REMOVE_NPCS.id) { self.world.removeNpcs(); }
                    if (data.id == Types.Actions.CALL_JACK_BAUER.id) { self.world.callBauer(self); }
                    if (data.id == Types.Actions.IDEA.id) { self.setAction({id: Types.Actions.IDEA.id, duration: Types.Actions.IDEA.duration}) }
                }
            }
            else if (Types.Messages.ADD_NPC == action) {
                self.world.addNpc();
            }
            else if (Types.Messages.REMOVE_NPCS == action) {
                self.world.removeNpcs();
            }
        });
    },

    isAdmin: function() {
        return (this.name && this.name.match(/admin$/));
    },

    setAction: function(action) {
        this.action = action;
    },

    setSprite: function(new_sprite) {
        this.sprite = new_sprite;
    },

    hasAction: function(id) {
        return _.findWhere(this.actionsAvailable, {id: id});
    },

    onExit: function(callback) {
        this.exit_callback = callback;
    },

    formatUsername: function(username) {
        return username.replace(/ /gi, "_").toLowerCase();
    },

    send: function(name, message) {
        this.socket.emit(name, message);
    }
});
