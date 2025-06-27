const PouchDB = require('pouchdb');

let db = new PouchDB('./database');

//Create worlds
let worldDemoRoom = {
    "_id": "world:DemoRoom",
    "lowerSrc": "./assets/maps/DemoLower.png",
    "upperSrc": "./assets/maps/DemoUpper.png",
    "characters": {
        "npcA": {
            "x": 7,
            "y": 9,
            "src": "./assets/characters/people/npc1.png",
            "facing": "up",
            "behaviorLoop": [
                { "type": "stand", "direction": "left", "time": 800 },
                { "type": "stand", "direction": "up", "time": 800 },
                { "type": "stand", "direction": "right", "time": 1200 },
                { "type": "stand", "direction": "up", "time": 300 }
            ],
            "talking": [
                {
                    "events": [
                        {
                            "type": "textMessage",
                            "text": "Hello world!",
                            "faceHero": "npcA"
                        },
                        { "type": "textMessage", "text": "Go away!" }
                    ]
                }
            ]
        },
        "npcB": {
            "x": 3,
            "y": 7,
            "facing": "down",
            "src": "./assets/characters/people/npc2.png",
            "behaviorLoop": [
                { "type": "walk", "direction": "left" },
                { "type": "stand", "direction": "up", "time": 800 },
                { "type": "walk", "direction": "up" },
                { "type": "walk", "direction": "right" },
                { "type": "walk", "direction": "down" }
            ]
        }
    },
    "walls": {
        "7,6": true,
        "8,6": true,
        "7,7": true,
        "8,7": true,
        "6,4": true,
        "8,4": true,
        "9,3": true,
        "10,3": true,
        "5,3": true,
        "4,3": true,
        "3,3": true,
        "2,3": true,
        "1,3": true,
        "7,9": true,
        "3,7": true
    },
    "portals": {
        "5,10": { "dest": "world:Street", "x": 5, "y": 9, "direction": "down" }
    },
    "screens": [
        {
            "id": "demoScreen",
            "x": 148,
            "y": 52,
            "side": 0,
            "src": "iVBORw0KGgoAAAANSUhEUgAAABgAAAAJCAIAAACnn3uRAAAAAXNSR0IArs4c6QAAAHlJREFUKJFjTGDnZ6AGYGFgYJi/fh2Fptj7+bLc+/sbwlHOKmdgYLg7rRPOhnDhbKyycCkmZIORtd2d1glXB2GgyaI5iokBB1DOKkd2C0HAgksC0078AMVFylnlcP34XYQpxWjHwrWjp58kyzGBR0khox0LF4WmQAAASPQt0A9kuaAAAAAASUVORK5CYII="
        }
    ]
};
let worldStreet = {
    "_id": "world:Street",
    "lowerSrc": "./assets/maps/StreetLower.png",
    "upperSrc": "./assets/maps/StreetUpper.png",
    "characters": {
        "npc1": {
            "x": 7,
            "y": 10,
            "facing": "left",
            "src": "./assets/characters/people/npc1.png"
        }
    },
    "portals": {
        "5,9": { "dest": "world:DemoRoom", "x": 5, "y": 10, "direction": "up" },
        "25,5": { "dest": "world:StreetNorth", "x": 7, "y": 16, "direction": "up" }
    }
};
let worldStreetNorth = {
    "_id": "world:StreetNorth",
    "lowerSrc": "./assets/maps/StreetNorthLower.png",
    "upperSrc": "./assets/maps/StreetNorthUpper.png",
    "characters": {},
    "portals": {
        "7,16": { "dest": "world:Street", "x": 25, "y": 5, "direction": "down" }
    }
};

let worldList = [
    worldDemoRoom,
    worldStreet,
    worldStreetNorth
]

worldList.forEach(w => {
    db.put(w).then(r => {
        console.log(`${w._id}: ${r.ok ? "Success" : "Failed"}`);
    })
})

db.put({
    _id: "worldlist",
    data: [
        "world:DemoRoom",
        "world:Street",
        "world:StreetNorth"
    ]
}).then(r => {
        console.log(`worldlist: ${r.ok ? "Success" : "Failed"}`);
})