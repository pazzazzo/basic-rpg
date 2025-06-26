class FakeIO {
    constructor() {
        this.emitted = [];
    }
    to(room) {
        return {
            emit: (event, ...args) => {
                this.emitted.push({ room, event, args });
            }
        };
    }
}

function createFakeServer() {
    return {
        io: new FakeIO(),
        overworlds: new Map(),
        database: { players: { test: { x: 0, y: 0, map: 'DemoRoom', skin: 'hero', isPlayer: true } }, maps: {} }
    };
}

function createFakeOverworld(id, server) {
    const overworld = new (require('../Overworld'))({ id, characters: {}, walls: {}, portals: {} }, server);
    server.overworlds.set(id, overworld);
    return overworld;
}

module.exports = { FakeIO, createFakeServer, createFakeOverworld };
