var cls = require("./lib/class"),
    _ = require("underscore"),
    Types = require("../../shared/js/gametypes");

module.exports = Entity = Class.extend({
    init: function(id, type, kind, config) {
        var self = this;

        this.id = id;
        this.type = type;
        this.kind = kind;
        this.world = config.world;
        this.name = config.name || "Lorem ipsum";
        this.direction = config.direction || "s";
        this.destination = config.destination || {};
        this.position = config.position || {
            x: 0,
            y: 0,
        };
        this.color = config.color || "transparent";
        this.size = config.size || {
            width: 30,
            height: 30,
        },
        this.velocity = {
            x: 0,
            y: 0,
        };
    },

    destroy: function() {

    },

    getState: function() {
        return {
            id: this.id,
            position: this.position
        };
    },

    isAtDestination: function() {
        var offset = {
                x: Types.Velocity.X,
                y: Types.Velocity.Y,
            };
        return (
            !_.isEmpty(this.destination)
            && (this.position.x > this.destination.x - offset.x && this.position.x < this.destination.x + offset.x)
            && (this.position.y > this.destination.y - offset.y && this.position.y < this.destination.y + offset.y)
        );
    }

});
