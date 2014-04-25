Types = {
    Messages: {
        INIT: 0,
        DISCONNECT: 1,
        STATE: 2,
        MOVE: 3,
        MESSAGE: 4,
        CHAT: 5,
        SPAWN: 6,
        DESPAWN: 7,
        ADD_NPC: 8,
        REMOVE_NPCS: 9,
    },

    Velocity: {
        X: 5,
        Y: 5,
    },

    Orientations: {
        UP: 1,
        DOWN: 2,
        LEFT: 3,
        RIGHT: 4,
    }
};

Types.getOrientationAsString = function(orientation) {
    switch(orientation) {
        case Types.Orientations.LEFT: return "left"; break;
        case Types.Orientations.RIGHT: return "right"; break;
        case Types.Orientations.UP: return "up"; break;
        case Types.Orientations.DOWN: return "down"; break;
    }
};

if(!(typeof exports === 'undefined')) {
    module.exports = Types;
}
