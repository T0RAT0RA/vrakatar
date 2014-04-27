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
            this.hair = config.hair;
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
            this.div.attr("data-direction", entity.direction);
            this.div.css({
                top: Math.round(entity.position.y - this.div.height()/2),
                left: Math.round(entity.position.x - this.div.width()/2)
            });
        },

        setName: function(name) {
            this.name = name;
        }
    });

    return Entity;
});
