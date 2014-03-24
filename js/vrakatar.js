//Variables init
var DIRECTION = {
        "UP": 38,
        "DOWN": 40,
        "LEFT": 37,
        "RIGHT": 39,
    },
    ACTION = {
        "IDLE": 1,
        "MOVING": 2,
        "CLIMBING": 3,
        "JUMPING": 4,
    },
    MODE = {
        "AUTO": 1,
        "MANUAL": 2,
    },
    SPACE = 32;

function Vrakatar(options) {
    this.options = options || {
        "name": "Default name",
        "id": "character",
        "class": null,
        "element": "<div/>",
        "append_to": "#doc",
        "css": {
            "position": "absolute",
            "top": "5%",
            "left": "30%",
            "width": "32px",
            "height": "32px",
            "background": "url('http://localhost/js/side_project/img/character1.png') no-repeat 0 0",
            "z-index": "100",
            "cursor": "pointer",
        },
        "sprite_config": {
            "cellSize": [32,32],
            "cells": [4, 3],
            "initCell": [2,0],
            "offset": [0, 0],
            "wrap": true,
        },
        "mode": MODE["MANUAL"],
        "direction": DIRECTION["RIGHT"],
        "action": {
            "type": ACTION["IDLE"],
            "duration": 0,
        },
        "velocity": 2,
    };

    this.init = function() {
        this.jquery_object = $(this.options.element);
        this.jquery_object.css(this.options.css).appendTo(this.options.append_to).prop("id", this.options.id).addClass(this.options.class);

        //Add Vrakatar name div
        this.name_div = $("<div />").addClass("name").html(this.options.name).css({
            "width": "100px",
            "font-size": "10px",
            "top": "-10px",
            "position": "relative",
            "left": "-10px",
        });
        this.jquery_object.prepend(this.name_div);

        //Add actions menu
        this.action_div = $("<div />").addClass("actions").append("<ul><li>Action 1</li><li>Action 2</li><li>Action 3</li></ul>");
        this.jquery_object.append(this.action_div);
        this.jquery_object.on("click", {action_div: this.action_div}, this.toggle_actions);

        this.init_sprite();

        this.name       = this.options.name;
        this.direction  = this.set_direction(this.options.direction);
        this.action     = this.set_action(this.options.action.type, this.options.action.duration);
        this.action_queue = [];
        this.velocity   = this.options.velocity;
    };

    this.init_sprite = function() {
        this.jquery_object.sprite(this.options.sprite_config);
    };

    this.toggle_actions = function(event) {
        event.data.action_div.toggle();
    };

    this.set_action = function(action, duration) {
        duration = typeof duration !== 'undefined' ? duration : 0;
        this.action = {
            "type": action,
            "duration": duration,
            "started_at": Date.now(),
        };
        //console.log("set_action", this.action);
        return this.action;
    };

    this.add_action = function(action, duration) {
        duration = typeof duration !== 'undefined' ? duration : 0;
        this.action_queue.push({
            "type": action,
            "duration": duration,
        });
    };

    this.set_direction = function(direction) {
        //console.log("set_direction", direction)
        this.direction = direction;
        switch(direction) {
            case DIRECTION["LEFT"]:
                this.css_prop = "left";
                this.velocity = -Math.abs(this.velocity);
                this.jquery_object.row(0);
            break;
            case DIRECTION["UP"]:
                this.css_prop = "top";
                this.velocity = -Math.abs(this.velocity);
                this.jquery_object.row(1);
            break;
            default:
            case DIRECTION["RIGHT"]:
                this.css_prop = "left";
                this.velocity = Math.abs(this.velocity);
                this.jquery_object.row(2);
            break;
            case DIRECTION["DOWN"]:
                this.css_prop = "top";
                this.velocity = Math.abs(this.velocity);
                this.jquery_object.row(3);
            break;
        }
    };

    this.update = function() {

        //Check for collisions
        hits = $('#character').collision($('.obstacle'), {as: "<div/>", directionData: "direction"});
        if (this.direction == DIRECTION["DOWN"] && $.inArray($(hits).data("direction"), ["S", "SE", "SW"]) >= 0) { return; }
        if (this.direction == DIRECTION["UP"] && $.inArray($(hits).data("direction"), ["N", "NE", "NW"]) >= 0) { return; }

        if (this.mode == MODE["AUTO"]) {
            //console.log("update", this.action.duration, Math.round((Date.now() - this.action.started_at) / 1000))
            //Check if we need to update the current action
            if (this.action_queue.length && this.action.duration <= 0) {
                var next_action = this.action_queue.shift();
                this.set_action(next_action.type, next_action.duration);
            }

            if (this.action.duration <= 0) {
                //Get random action
                var i = this.get_random_int(0, 100);
                if (i <= 30) {
                    this.set_direction(DIRECTION[this.get_random_property(DIRECTION)]);
                    this.set_action(ACTION["MOVING"], this.get_random_int(1, 2));
                } else {
                    this.set_direction(DIRECTION[this.get_random_property(DIRECTION)]);
                    this.set_action(ACTION["IDLE"], this.get_random_int(2, 5));
                }

            }
        }

        if (this.action.type == ACTION["MOVING"]) {
            this.jquery_object.next();
            var prop = "left",
                nextPos = parseInt(this.jquery_object.css(this.css_prop), 10) + this.velocity;
            this.jquery_object.css(this.css_prop, nextPos);
            /*
            if (prop == 'top') {
                if(nextPos < 0 - 32) nextPos = BOARD_HEIGHT;
                if(nextPos > BOARD_HEIGHT) nextPos = 0 - 32;
                this.jquery_object.css(prop, nextPos);
            } else if (prop == 'left') {
                if(nextPos < 0 - 32) nextPos = BOARD_WIDTH;
                if(nextPos > BOARD_WIDTH) nextPos = 0 - 32;
                this.jquery_object.css(prop, nextPos);
            }
            */
        }

        if (Math.round((Date.now() - this.action.started_at) / 1000) >= this.action.duration) {
            this.action.duration = 0
        }
    };

    this.get_random_property = function (obj) {
        var keys = Object.keys(obj),
            prop = keys[this.get_random_int(0, keys.length-1)];

        return prop;
    };

    this.get_random_int = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    this.init();
}

var BOARD_WIDTH = $("#doc").width(),
    BOARD_HEIGHT = $("#doc").height(),
    player = new Vrakatar();

$(window).keydown(function(e) {
    direction = e.keyCode;
    if($.inArray(direction, [DIRECTION["UP"], DIRECTION["DOWN"], DIRECTION["LEFT"], DIRECTION["RIGHT"]]) >= 0) {
        player.set_direction(direction);
        player.set_action(ACTION["MOVING"]);
        e.preventDefault();
    }
});

$(window).keyup(function(e) {
    player.set_action(ACTION["IDLE"]);
    e.preventDefault();
});

Game = {};
Game.fps = 60;
Game.run = function() {
    Game.update();
};

Game.stop = function() {
    clearInterval(Game._intervalId);
}

Game.start = function() {
    Game._intervalId = setInterval(Game.run, 1000 / Game.fps);
}

Game.update = function() {
    player.update();
};

// Start the game loop
Game.start();
