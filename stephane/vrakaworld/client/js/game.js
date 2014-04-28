define(["player", "npc"], function (Player, Npc) {

    var Game = Class.extend({
        init: function(app, socket, username) {
            var self = this;

            this.app = app;
            this.socket = socket;
            this.ups = 20;

            this.map = null;

            this.player     = {name: username};
            this.entities   = {};

            this.bindActions();

            socket.on(Types.Messages.STATE, this.updateGameState.bind(this));
            socket.on(Types.Messages.SPAWN, this.addEntity.bind(this));
            socket.on(Types.Messages.DESPAWN, this.removeEntity.bind(this));
            socket.on(Types.Messages.CHAT, this.onChat.bind(this));
            socket.on(Types.Messages.INIT, this.initPlayer.bind(this));
            socket.on(Types.Messages.MESSAGE, this.app.logMessages.bind(this.app));
            socket.on("disconnect", this.app.game_disconnect_callback.bind(this.app));

            //Init player data
            socket.emit(Types.Messages.INIT, {name: self.player.name});

            console.log("Game - init");

            if (this.app.game_init_callback) {
                this.app.game_init_callback();
            }
        },

        onInit: function(callback) {
            this.init_callback = callback;
        },

        initPlayer: function (player) {
            this.player = player;
        },

        run: function(mapFilePath) {

        },

        updateGameState: function(data) {
            //this.app.printGameState(data);

            //update entities
            for (i in data.entities) {
                entity = data.entities[i];
                if (this.entities[entity.id]) {
                    this.entities[entity.id].update(entity);
                }
            }
        },

        onChat: function (data) {
            var entity_div = $(".entity#"+data.id),
                entity_div_say = entity_div.find(".say");

            if (!entity_div.length) { return; }

            this.app.logMessages(data.name + ": " + data.message);

            entity_div_say.stop(true);
            entity_div_say.html(data.message)
                .css({
                    width: (data.message.length * 10)+"px"
                });
            entity_div_say.show('fast').delay(5000).hide('fast');
        },

        addEntity: function(entity) {
            if (entity.type == "player") {
                player = new Player(entity.id, entity)

                if (entity.id == this.player.id) {
                    player.setCurrentPlayer();
                }
                this.entities[player.id] = player;
            }
            if (entity.type == "npc") {
                npc = new Npc(entity.id, entity.kind, entity)
                this.entities[npc.id] = npc;
            }
        },

        removeEntity: function(entity) {
            if(entity.id in this.entities) {
                $(".entity#"+entity.id).hide("explode", function(){ this.remove(); });
                delete this.entities[entity.id];
            }
        },

        bindActions: function() {
            var self = this;
            $(window).on("keydown", function(e) {
                if(e.keyCode == 13) {
                    //Open the chat on enter
                    if ($(".chat").is(":hidden")) {
                        $(".chat").show().focus();
                    }
                    //Else, send the message
                    else {
                        if ($(".chat").val()) {
                            self.socket.emit(Types.Messages.CHAT, $(".chat").val());
                        }
                        $(".chat").val("").hide();
                    }
                }
            });

            $(".game").on("click", ".action", function() {
                self.socket.emit(Types.Messages.ACTION, {id: $(this).data("id")});
            });

            $(".game").on("click", ".player", function(e) {
                $(this).find(".actions").toggle();
            });

            $(".game").on("click", ".map", function(e) {
                var offset = $(this).offset();
                self.socket.emit(Types.Messages.MOVE, {
                    x: e.pageX - offset.left,
                    y: e.pageY - offset.top,
                });
            });
        }
    });

    return Game;
});
