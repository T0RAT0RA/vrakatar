define(["player", "npc", "gameRenderer"], function (Player, Npc, GameRenderer) {

    var Game = Class.extend({
        init: function(app, socket, username, worldId) {
            var self = this;

            this.app = app;
            this.socket = socket;
            this.mobileUps = 10;

            this.worldId    = worldId;
            this.map        = null;
            this.render     = new GameRenderer(this);
            this.lastUpdate = 0;

            this.player     = {name: username};
            this.entities   = {};
            this.audio      = {};

            this.bindActions();

            socket.on(Types.Messages.STATE, this.updateGameState.bind(this));
            socket.on(Types.Messages.SPAWN, this.addEntity.bind(this));
            socket.on(Types.Messages.DESPAWN, this.removeEntity.bind(this));
            socket.on(Types.Messages.CHAT, this.onChat.bind(this));
            socket.on(Types.Messages.ACTION, this.onAction.bind(this));
            socket.on(Types.Messages.INIT, this.initPlayer.bind(this));
            socket.on(Types.Messages.MAP, this.render.initMap.bind(this.render));
            socket.on(Types.Messages.MESSAGE, this.app.logMessages.bind(this.app));
            socket.on("disconnect", this.app.game_disconnect_callback.bind(this.app));

            //Init player data
            socket.emit(Types.Messages.ENTERWORLD, {world: this.worldId});
            socket.emit(Types.Messages.INIT, {name: this.player.name});

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

        updateGameState: function(data) {
            //Temporariy solution to reduce processing on mobiles
            if (this.app.isMobile() && Date.now() - this.lastUpdate <= 1000/this.mobileUps) {
                return;
            }

            this.app.printGameState(data);

            //update entities
            for (i in data.entities) {
                entity = data.entities[i];
                if (this.entities[entity.id]) {
                    this.entities[entity.id].update(entity);
                }
            }

            this.lastUpdate = Date.now();
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

        onAction: function (data) {
            console.log("onAction", data)
            if (data.id == Types.Actions.CALL_JACK_BAUER.id) {
                if (!this.audio.ctu) {
                    this.audio.ctu = new Audio("audio/ctu24.mp3");
                }
                this.audio.ctu.play();
            }
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
            /*
            $(".game").on("click", ".map", function(e) {
                var offset = $(this).offset();
                self.socket.emit(Types.Messages.MOVE, {
                    x: e.pageX - offset.left,
                    y: e.pageY - offset.top,
                });
            });
            */
        }
    });

    return Game;
});
