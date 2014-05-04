var cls = require("./lib/class"),
    _ = require("underscore"),
    Types = require("../../shared/js/gametypes");

module.exports = Player = Class.extend({
    init: function(config) {
        var self = this;

        this.socket = config.socket;

        this._super(this.socket.id, "player", "player", config);

        this.hair = Types.Clothes.HAIR.BLOND;
        this.hasEnteredGame = false;
        this.actionsAvailable = [Types.Actions.CHANGE_HAIR];

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
                    if (data.id == Types.Actions.CHANGE_HAIR.id) { self.toggleHair(); }
                    if (data.id == Types.Actions.ADD_NPC.id) { self.world.addNpc(); }
                    if (data.id == Types.Actions.REMOVE_NPCS.id) { self.world.removeNpcs(); }
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

    isAdmin: function(new_hair) {
        return (this.name && this.name.match(/admin$/));
    },

    setHair: function(new_hair) {
        this.hair = new_hair;
    },

    toggleHair: function() {
        var new_hair = Types.Clothes.HAIR.BLOND;

        if (_.isEqual(this.hair, Types.Clothes.HAIR.BLOND)) {
            new_hair = Types.Clothes.HAIR.RED;
        } else if (_.isEqual(this.hair, Types.Clothes.HAIR.RED)){
            new_hair = Types.Clothes.HAIR.WEIRD;
        }

        this.setHair(new_hair);
    },

    hasAction: function(id) {
        return _.findWhere(this.actionsAvailable, {id: id});
    },

    onExit: function(callback) {
        this.exit_callback = callback;
    },

    send: function(name, message) {
        this.socket.emit(name, message);
    }
});
