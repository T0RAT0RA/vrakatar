define(function() {

    var Entity = Class.extend({
        init: function(id, type, kind, config) {
            var self = this;

            this.id = id;
            this.type = type;
            this.kind = kind;
            this.name = config.name || "Lorem ipsum";
            this.direction = config.direction || "s";
            this.color = config.color;
            this.position = config.position;
            this.size = config.size;
            this.actionsAvailable = config.actionsAvailable;

            this.createDiv();
        },

        createDiv: function() {
            this.div = $("<div>", {
                "class": ["entity", this.type].join(" "),
                id: this.id
            }).appendTo(".game");

            this.div.css({
                top: Math.round(this.position.y - this.div.height()/2),
                left: Math.round(this.position.x - this.div.width()/2)
            });
        },

        update: function(entity){
            this.velocity = entity.velocity;

            this.div.attr("data-direction", entity.direction);
            this.div.css({
                top: entity.position.y,
                left: entity.position.x
            });

            if (this.isMoving()) {
                this.animate();
            }
        },

        setName: function(name) {
            this.name = name;
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
                this.div.find(".hair[data-type=blond]").css({"background-position-x": "-" + (3*32 + this.animation*32) + "px"});
                this.lastCheck = Date.now();
            }
        }
    });

    return Entity;
});
