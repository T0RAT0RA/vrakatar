function connect(name) {
    var socket = io.connect('http://localhost');
    var DIRECTION = {}

    $(".game").removeClass("not-connected").addClass("connected");
    socket.on('disconnect', function(){
        disconnect();
        io.disconnect();
    });

    socket.emit('player.name', {name: name});
    socket.on('game.init', function (data) {
        $(".game").css({
            width: data.MAP.WIDTH+"px",
            height: data.MAP.HEIGHT+"px"
        });
        DIRECTION = data.DIRECTION;
    });

    //Print game state:
    var pre = $("<pre>").appendTo(".game-state");
    $(".game-state").show();
    socket.on('game.state', function (data) {
        pre.html(JSON.stringify(data, null, 2));
        //update players
        for (i in data.players) {
            player = data.players[i];
            player.div = $(".player#"+player.id);

            //Create the player div if not exist
            if (!player.div.length) {
                player.div = $("<div>").addClass("player").attr("id", player.id).appendTo(".game");
                $("<div>").addClass("name")
                    .html(player.name)
                    .css({
                        width: (player.name.length * 5)+"px",
                        left: (-player.name.length * 5/2 + parseInt(player.div.css("width")) )+"px"
                    })
                    .appendTo(player.div);
            }
            player.div.css({
                top: player.position.x,
                left: player.position.y
            });
        }
    });
    socket.on('game.player.disconnect', function (playerId) {
        $(".player#"+playerId).remove();
    });


    //Bind actions
    $(window).on("keydown", function(e) {
        if($.inArray(e.keyCode, [DIRECTION["UP"], DIRECTION["DOWN"], DIRECTION["LEFT"], DIRECTION["RIGHT"]]) >= 0) {
            socket.emit('player.keydown', e.keyCode);
            e.preventDefault();
        }
    });

    $(window).on("keyup", function(e) {
        if($.inArray(e.keyCode, [DIRECTION["UP"], DIRECTION["DOWN"], DIRECTION["LEFT"], DIRECTION["RIGHT"]]) >= 0) {
            socket.emit('player.keyup', e.keyCode);
            e.preventDefault();
        }
        e.preventDefault();
    });

    $(".game-state").on("click", ".addRandomPlayer", function(e) {
        socket.emit('game.addRandomPlayer');
    });

}

function disconnect() {
    $(".game").removeClass("connected").addClass("not-connected");
    $(".player").remove();
    $(".game-state").hide();
    $(window).off("keyup keydown");
}

//Register player
$(".game .register").on("submit", function(){
    var name = $(this).find(".name");

    if (!name.val()){
        name.addClass("error");
        name.focus();
    } else {
        name.removeClass("error");
        connect(name.val());
    }

    return false;
});
