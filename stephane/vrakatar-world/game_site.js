//Utils & constants
var extend = require('util')._extend,
    VELOCITY = {X: 10, Y:10};

//Init game
var Game = {},
    players = {};

Game.start = function(io) {
    
}

Game.randomInt = function(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

module.exports = function(io) {
    Game.start(io);
};
