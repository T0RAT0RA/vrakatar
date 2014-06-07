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
        ACTION: 8,
        MAP: 9,
        ENTERWORLD: 10
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

    Actions: {
        GET_ITEM: {
            id: 1,
            label: "Prendre l'objet"
        },
        IDEA: {
            id: 2,
            label: "J'ai une idée",
            duration: 2000
        },
        SAY_HI: {
            id: 3,
            label: "Dire salut"
        },
        PARTY: {
            id: 4,
            label: "-"
        },
        ADD_NPC: {
            id: 5,
            label: "Add NPC"
        },
        REMOVE_NPCS: {
            id: 6,
            label: "Remove NPCs"
        }
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
