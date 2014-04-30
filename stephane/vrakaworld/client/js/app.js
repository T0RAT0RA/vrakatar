define(["io", "game"], function (io, Game) {
    var socket = io.connect('http://localhost:1337'),
        game = {};

    var App = Class.extend({
        init: function() {
            this.log_div = ".game-state .messages";

            console.log("App - init");
            this.initLogin();

            $(".game .register button").show();
            $(".game .register .loader").remove();
        },

        initLogin: function() {
            var self = this;
            console.log("App - initLogin");

            //Register player
            $(".game .register").on("submit", function(){
                var name = $(this).find(".name");

                if (!name.val()){
                    name.addClass("error");
                    name.focus();
                } else {
                    name.removeClass("error");
                    self.connect(name.val());
                }

                return false;
            });
        },

        connect: function(username) {
            console.log("App - connect");
            this.onGameInit(function(){
                console.log("App - onGameInit");
                $(".game").removeClass("not-connected").addClass("connected");
                $(".game-state, .game .map").show();
            });

            this.onGameDisconnect(function(){
                console.log("App - onGameDisconnect");
                $(".reload").remove();
                $("<div>", {"class": "reload"}).prependTo($("body"));
                $(".reload").append($("<div>").html("You've been disconnected. Please reload the page"));
            });

            game = new Game(this, socket, username);
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
            var pre = $(".game-state pre");
            pre.html(JSON.stringify(data, null, 2));
        }
    });

    var app = new App();
});
