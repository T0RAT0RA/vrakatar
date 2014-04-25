var _ = require("underscore");

module.exports = Npc = Entity.extend({
    init: function(id, config) {
        config.name = config.name || this.getRandomName();
        config.color = config.color ||  "#A00";
        this._super(id, "npc", config);
    },

    getRandomName: function() {
        return _.shuffle([
            "Rasmus Gustav",
            "Valter Daniel",
            "Ingvar Rudolf",
            "Asbjörn Mathias",
            "Bertil Jakob",
            "Ludvig Stig",
            "Matthias Jöran",
            "Tobias Erik",
        ])[0];
    },

    onExit: function(callback) {
        this.exit_callback = callback;
    }
});
