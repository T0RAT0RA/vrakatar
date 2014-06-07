define(['entity'], function(Entity) {

    var Player = Entity.extend({
        init: function(id, config) {
            this._super(id, "player", Types.Entities.PLAYER, config);
            this.isCurrentPlayer = false;
        },

        setCurrentPlayer: function(){
            this.isCurrentPlayer = true;

            this.div.addClass("current");

            //Player actions div
            var actions = $("<div>", {
                "class": "actions",
                css: {
                    left: this.div.width()
                }
            }).appendTo(this.div);

            if (this.actionsAvailable) {
                var ul = $("<ul>");
                for (i in this.actionsAvailable) {
                    action = this.actionsAvailable[i];

                    $("<li>", {
                        "class": "action",
                        "data-id": action.id,
                        html: action.label,
                    }).appendTo(ul);
                }
                ul.appendTo(actions);
            }

        },

        isCurrentPlayer: function(){
            return this.isCurrentPlayer;
        },

        createDiv: function(){
            this._super();

            //Entity name div
            $("<div>", {
                "class": "name",
                html: this.name,
                css: {
                    width: (this.name.length * 5)+"px"
                }
            }).appendTo(this.div);

            //Entity say div
            $("<div>", {
                "class": "say"
            }).appendTo(this.div);
        },

        update: function(player){
            var self = this;
            this._super(player);

            if (player.action && player.action.id == Types.Actions.IDEA.id) {
                if (!self.div.find(".idea").length) {
                    var timer = player.action.duration - (Date.now() - player.action.startedAt);
                    $("<div>", {"class": "idea"}).prependTo(self.div).delay(timer).hide('fast', function(){ this.remove(); });
                }
            }
        }
    });

    return Player;
});
