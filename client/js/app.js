define(["io", "game"], function (io, Game) {
    //Dirty hack to get the socket hostname from io
    //Don't ever, ever use this
    for (hostname in io.sockets) break;
    console.log("hostname", hostname)

    var socket = io.connect("http://"+hostname),
        game = {};

    var App = Class.extend({
        init: function() {
            this.log_div = ".game-state .messages";

            console.log("App - init");
            this.initLogin();

            $(".game .register button").show();
            $(".game .register .loader").remove();

            socket.on(Types.Messages.WORLDSINFO, this.updateWoldsInfo.bind(this));
        },

        initLogin: function() {
            var self = this;
            console.log("App - initLogin");

            //Register player
            $(".game .register").on("submit", function(){
                var name = $(this).find(".name"),
                    world = $(this).find(".world");

                if (!name.val()){
                    name.addClass("error");
                    name.focus();
                } else {
                    name.removeClass("error");
                    self.connect(name.val(), world.val());
                }

                return false;
            });
        },

        connect: function(username, worldId) {
            console.log("App - connect");
            this.onWorldFull(function(){
                console.log("App - onWorldFull");
                delete this;
            });
            this.onGameInit(function(){
                console.log("App - onGameInit");
                $(".game").removeClass("not-connected").addClass("connected");
                $(".game-state, .game .map").show();
                $(".display-game-state").on("change", function(){
                    if (!$(this).is(":checked")) {
                        $(".game-state pre").html("");
                    }
                });
            });

            this.onGameDisconnect(function(){
                console.log("App - onGameDisconnect");
                $(".reload").remove();
                $("<div>", {"class": "reload"}).prependTo($("body"));
                $(".reload").append($("<div>").html("You've been disconnected. Please reload the page"));
            });

            game = new Game(this, socket, username, worldId);
        },

        onWorldFull: function(callback) {
            this.world_full_callback = callback;
        },

        onGameInit: function(callback) {
            this.game_init_callback = callback;
        },

        onGameDisconnect: function(callback) {
            this.game_disconnect_callback = callback;
        },

        logMessages: function(message) {
            $("<div>").html(message).hide().prependTo(this.log_div).fadeIn().delay(5000).fadeOut();
        },

        printGameState: function (data) {
            if (!$(".display-game-state").is(":checked")) { return; }
            $(".game-state pre").html(JSON.stringify(data, null, 2));
        },

        updateWoldsInfo: function (data) {
            console.log(data);
            for (id in data.worlds) {
                $(".register .world").append($("<option>",{
                    value: id,
                    text: id + " (" + data.worlds[id].players + "/" + data.worlds[id].maxPlayers + ")"
                }));
            }
        },

        isMobile: function(){
            return (navigator.userAgent.match(/Android/i)
                 || navigator.userAgent.match(/webOS/i)
                 || navigator.userAgent.match(/iPhone/i)
                 || navigator.userAgent.match(/iPad/i)
                 || navigator.userAgent.match(/iPod/i)
                 || navigator.userAgent.match(/BlackBerry/i)
                 || navigator.userAgent.match(/Windows Phone/i)
            )
        }
    });

    var app = new App();
});
