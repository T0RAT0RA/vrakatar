define(['entity'], function(Entity) {

    var NpcTalk = {
        "pikachu": [
            "lorem ipsum",
            "loREM ipsum.."
        ],
        "wolverine": [
            "lorem ipsum",
            "loREM ipsum.."
        ],
    };

    var Npc = Entity.extend({
        init: function(id, kind, config) {
            this._super(id, "npc", kind, config);
            console.log(this.kind);
            this.talkCount = NpcTalk[this.kind]? NpcTalk[this.kind].length : 0;
            this.talkIndex = 0;
        },

        talk: function() {
            var msg = null;

            if(this.talkIndex > this.talkCount) {
                this.talkIndex = 0;
            }
            if(this.talkIndex < this.talkCount) {
                msg = NpcTalk[this.itemKind][this.talkIndex];
            }
            this.talkIndex += 1;

            return msg;
        },


        createDiv: function(){
            this._super();

            //Entity hair div
            if (this.hair) {
                $("<div>", {
                    "class": "hair",
                    "data-type": this.hair,
                }).appendTo(this.div);
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

        update: function(player){
            this._super(player);
            this.div.find(".hair").attr("data-type", player.hair);
        }
    });

    return Npc;
});
