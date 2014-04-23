
var cls = require("./lib/class"),
    _ = require("underscore");

module.exports = Player = Class.extend({
    init: function(config) {
        var self = this;

        this.server = config.worldServer;
        this.socket = config.socket;
        this.id     = this.socket.id;

        this.name = config.name || "Lorem ipsum";
        this.x = 0;
        this.y = 0;

        this.socket.on("disconnect", function() {
            if(self.exit_callback) {
                self.exit_callback();
            }
        });
    },

    onExit: function(callback) {
        this.exit_callback = callback;
    },

    send: function(message) {
        this.socket.emit(message);
    }
});
