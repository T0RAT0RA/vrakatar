define(['entity'], function(Entity) {

    var Player = Entity.extend({
        init: function(id, config) {
            this.hair = config.hair;
            this._super(id, "player", Types.Entities.PLAYER, config);
            this.isCurrentPlayer = false;
            this.animation = 0;
            this.lastCheck = Date.now();
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

            //Entity hair div
            if (this.hair) {
                this.updateHairDiv(this.hair);
            }

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

        updateHairDiv: function(hair){
            var self = this;
            this.hair = hair;

            this.div.find(".hair").remove();
            _.each(this.hair, function(type) {
                $("<div>", {"class": "hair", "data-type": type}).prependTo(self.div);
            });
        },

        update: function(player){
            this._super(player);

            if (!_.isEqual(player.hair, this.hair)) {
                this.updateHairDiv(player.hair);
            }

            if (this.isMoving()) {
                this.animate();
            }
        },

        isMoving: function(){
            return (this.velocity && (this.velocity.x || this.velocity.y));
        },

        animate: function(){
            var time = Date.now();

            if (time - this.lastCheck >= 1000/25) {
                this.animation++;
                if (this.animation >= 3) this.animation = 0;

                this.div.css({"background-position-x": "-" + this.animation*32 + "px"});
                //Animate the hair: this.div.find(".hair")
                this.lastCheck = Date.now();
            }
        }
    });

    return Player;
});
