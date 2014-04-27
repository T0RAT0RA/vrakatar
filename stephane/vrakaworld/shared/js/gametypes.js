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
        ACTION: 8
    },

    Entities: {
        PLAYER: 1,

        // NPCs
        BIBER: 2,
        PIKACHU: 3,
        WOLVERINE: 4,
        NOBODY: 5,

        // Objects
        HAT: 6,
    },

    Clothes: {
        HAIR1: "blond",
        HAIR2: "red",
    },

    Actions: {
        CHANGE_HAIR: {
            id: 1,
            label: "Changer de cheveux"
        },
        SAY_HI: {
            id: 2,
            label: "Dire salut"
        },
        PARTY: {
            id: 3,
            label: "-"
        },
        ADD_NPC: {
            id: 4,
            label: "Add NPC"
        },
        REMOVE_NPCS: {
            id: 5,
            label: "Remove NPCs"
        },
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
