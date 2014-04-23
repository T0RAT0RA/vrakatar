function connect(name) {
    socket = io.connect('http://localhost:8000');
    var DIRECTION = {};
    var player_idplayer_id = null;


    $(".game").removeClass("not-connected").addClass("connected");
    socket.on('disconnect', function(){
        disconnect();
    });

    socket.emit('player.name', {name: name});
    socket.on('game.init', function (data) {
        $(".map").css({
            width: data.MAP.WIDTH+"px",
            height: data.MAP.HEIGHT+"px"
        });
        DIRECTION = data.DIRECTION;
        player_id = data.player.id;
        stage = generateMap(data.MAP.WIDTH, data.MAP.HEIGHT);
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
                //Player parent div
                player.div = $("<div>").addClass("player").attr("id", player.id).appendTo(".game");

                //Player name div
                $("<div>").addClass("name")
                    .html(player.name)
                    .css({
                        width: (player.name.length * 5)+"px"
                    })
                    .appendTo(player.div);

                if (player_id == player.id) {
                    player.div.addClass("current");

                    //Player actions div
                    $("<div>").addClass("actions")
                        .append("<ul><li data-action='hi'>Dire salut</li><li data-action='talk'>Parler</li><li data-action='blink'>😈</li></ul>")
                        .appendTo(player.div);
                }
                player.div.css({
                    //"background-color": player.color,
                    //height: player.height+"px",
                    //width: player.width+"px",
                    top: player.position.y - 50,
                    left: player.position.x + 30
                });
            }

            player.div.attr("data-direction", player.direction);
            player.div.css({
                top: player.position.y - 50,
                left: player.position.x + 30
            });

            //Player talk
            if (player.talk) {
                if (!player.div.find(".talk").length) {
                    $("<div>").addClass("talk")
                        .appendTo(player.div);
                }
                player.div.find(".talk").html(player.talk);
            } else {
                player.div.find(".talk").remove();
            }
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
    });

    $(".game-state").on("click", ".addRandomPlayer", function(e) {
        socket.emit('game.addRandomPlayer');
    });

    $(".game-state").on("click", ".deleteRandomPlayers", function(e) {
        socket.emit('game.deleteRandomPlayers');
    });

    $(".game").on("click", ".player", function(e) {
        $(this).find(".actions").toggle();
    });

    $(".game").on("click", ".player [data-action]", function(e) {
        socket.emit('player.action', $(this).data("action"));
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

function generateMap(width, height) {
    var WIDTH = width;
    var HEIGHT = height;
    var stage = new PIXI.Stage(0xEEFFFF, true);
    var renderer = PIXI.autoDetectRenderer(WIDTH, HEIGHT);

    document.querySelector(".map").appendChild(renderer.view);
    var loader = new PIXI.AssetLoader(['/img/tiles/roadTiles.json']);

    function isoTile(filename) {
      return function(x, y) {
        var tile = PIXI.Sprite.fromFrame(filename);
        tile.buttonMode = true;
        tile.position.x = x;
        tile.position.y = y;

        // bottom-left
        tile.anchor.x = 0;
        tile.anchor.y = 1;

        tile.setInteractive(true);
        tile.click = function(mouseData){
           socket.emit('player.click', {x: x, y: y});
        }
        stage.addChild(tile);

      }
    }

    // map
    var G=0, D=1, W=2, S=3;
    var terrain = [
        [G, G, G, G, S, S, G, G, G, G],
        [D, D, G, G, D, S, G, G, G, G],
        [D, G, G, D, D, D, S, S, G, G],
        [D, S, D, G, D, D, S, G, G, G],
        [G, G, S, D, D, S, S, G, G, G],
        [G, G, S, D, D, S, S, G, G, G],
        [G, G, S, S, S, S, S, G, G, G],
        [G, G, G, G, S, S, G, G, G, G],
        [G, G, W, W, G, G, G, G, G, G],
        [G, W, W, W, G, G, G, G, G, G],
    ];

    // Tiles with height can exceed these dimensions.
    var tileHeight = 50;
    var tileWidth = 50;

    // tiles
    var grass = isoTile('grass.png');
    var dirt = isoTile('dirt.png');
    var water = isoTile('water.png');
    var sand = isoTile('beach.png');
    var tileMethods = [grass, dirt, water, sand];

    function drawMap(terrain, xOffset, yOffset) {
        var tileType, x, y, isoX, isoY, idx;

        for (var i = 0, iL = terrain.length; i < iL; i++) {
            for (var j = 0, jL = terrain[i].length; j < jL; j++) {
                // cartesian 2D coordinate
                x = j * tileWidth;
                y = i * tileHeight;

                // iso coordinate
                isoX = x - y;
                isoY = (x + y) / 2;

                tileType = terrain[i][j];
                drawTile = tileMethods[tileType];
                drawTile(isoX + xOffset, isoY + yOffset);
            }
        }
    }

    loader.onComplete = start;
    loader.load();

    function start() {
      drawMap(terrain, WIDTH / 2, tileHeight * 1.5);

      function animate() {
        requestAnimFrame(animate);
        renderer.render(stage);
      }
      requestAnimFrame(animate);
    }

    $(".map").show();

    return stage;
};
