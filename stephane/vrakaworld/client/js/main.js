socket = io.connect('http://localhost:8000');
var player = {};

function logMessages(message) {
    $("<div>").html(message).hide().prependTo(".game-state .messages").fadeIn().delay(5000).fadeOut();
}

function connect(name) {

    $(".game").removeClass("not-connected").addClass("connected");
    $(".game-state, .game .map").show();

    socket.emit(Types.Messages.INIT, {name: name});
    socket.on(Types.Messages.INIT, function (data) {
        player.id = data.id;
    })

    socket.on(Types.Messages.MESSAGE, function (data) {
        logMessages(data);
    })

    socket.on(Types.Messages.CHAT, function (data) {
        var entity_div = $(".entity#"+data.id),
            entity_div_say = entity_div.find(".say");

        if (!entity_div.length) { return; }

        logMessages(data.name + ": " + data.message);

        entity_div_say.stop(true);
        entity_div_say.html(data.message)
            .css({
                width: (data.message.length * 10)+"px"
            });
        entity_div_say.show('fast').delay(5000).hide('fast');

    })

    //Spawn new entity
    socket.on(Types.Messages.SPAWN, function (data) {
        //Abort if the entity already exist
        if ($(".entity#"+data.id).length) { return; }

        entity_div = $("<div>").addClass("entity "+data.type).attr("id", data.id).appendTo(".game");

        //Player name div
        $("<div>").addClass("name")
            .html(data.name)
            .css({
                width: (data.name.length * 5)+"px"
            })
            .appendTo(entity_div);

        //Player say div
        $("<div>").addClass("say")
            .appendTo(entity_div);

        if (data.id == player.id) {
            entity_div.addClass("current");

            //Player actions div
            $("<div>").addClass("actions")
                .append("<ul><li data-action='hi'>Dire salut</li><li data-action='talk'>Parler</li><li data-action='blink'>😈</li></ul>")
                .appendTo(entity_div);
        }
        entity_div.css({
            "background-color": data.color,
            height: data.size.height+"px",
            width: data.size.width+"px",
            left: data.position.x+"px",
            top: data.position.y+"px"
        });
    });

    //Despawn new entity
    socket.on(Types.Messages.DESPAWN, function (data) {
        $(".entity#"+data.id).hide("explode", function(){ this.remove(); });
    })


    //Print game state:
    var pre = $(".game-state pre");
    socket.on(Types.Messages.STATE, function (data) {
        pre.html(JSON.stringify(data, null, 2));

        //update entities
        for (i in data.entities) {
            entity = data.entities[i];
            entity.div = $(".entity#"+entity.id);

            entity.div.attr("data-direction", entity.direction);
            entity.div.css({
                top: entity.position.y ,
                left: entity.position.x
            });
        }
    });

    //Bind actions
    $(window).on("keydown", function(e) {
        if(e.keyCode == 13) {
            //Open the chat on enter
            if ($(".chat").is(":hidden")) {
                $(".chat").show().focus();
            }
            //Else, send the message
            else {
                socket.emit(Types.Messages.CHAT, $(".chat").val());
                $(".chat").val("").hide();
            }
        }
        /*
        if($.inArray(e.keyCode, [DIRECTION["UP"], DIRECTION["DOWN"], DIRECTION["LEFT"], DIRECTION["RIGHT"]]) >= 0) {
            socket.emit('player.keydown', e.keyCode);
            e.preventDefault();
        }
        */
    });

    $(window).on("keyup", function(e) {
        /*
        if($.inArray(e.keyCode, [DIRECTION["UP"], DIRECTION["DOWN"], DIRECTION["LEFT"], DIRECTION["RIGHT"]]) >= 0) {
            socket.emit('player.keyup', e.keyCode);
            e.preventDefault();
        }
        */
    });

    $(".game-state .actions").on("click", "button", function() {
        var $this = $(this),
            action = $this.data("action");

        if ("addNPC" == action) {
            socket.emit(Types.Messages.ADD_NPC);
        }
        else if ("deleteNPCS" == action) {
            socket.emit(Types.Messages.REMOVE_NPCS);
        }
    });

    $(".game").on("click", ".player", function(e) {
        $(this).find(".actions").toggle();
    });

    $(".game").on("click", ".player [data-action]", function(e) {
        socket.emit('player.action', $(this).data("action"));
    });

    $(".game").on("click", ".map", function(e) {
        var offset = $(this).offset();
        socket.emit(Types.Messages.MOVE, {
            x: e.pageX - offset.left,
            y: e.pageY - offset.top,
        });
    });
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
