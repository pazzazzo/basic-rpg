const Person = require('./Person.js');
const Server = require('./Server.js');
const { nextPosition } = require('./Utils.js');

class Overworld {
    /**
     * 
     * @param {Object} config 
     * @param {Server} server 
     */
    constructor(config, server) {
        /** @type {Server} */
        this.server = server;

        this.config = config;

        /** @type {String} */
        this.id = config._id || null;

        /** @type {Map<String, GameObject>} */
        this.characters = new Map();

        /** @type {Object} */
        this.walls = config.walls || {};

        this.portals = config.portals || {};

        for (const character in config.characters) {
            let char = new Person({ _id: character, ...config.characters[character] }, this.server)
            char.mount(this);
        }
    }

    isSpaceTaken(currentX, currentY, direction) {
        const { x, y } = nextPosition(currentX, currentY, direction)
        return this.walls[`${x},${y}`] || false
    }
    isPortal(currentX, currentY, direction) {
        const { x, y } = nextPosition(currentX, currentY, direction)
        return this.portals[`${x},${y}`] || false
    }

    /**
     * 
     * @param {number} currentX 
     * @param {number} currentY 
     * @param {string} direction 
     * @param {Person} person 
     */
    usePortal(currentX, currentY, direction, person) {
        const portal = this.portals[`${currentX},${currentY}`];
        if (portal) {
            const { x, y, dest, direction } = portal;
            const destWorld = this.server.overworlds.get(dest)
            person.x = x;
            person.y = y;
            person.facing = direction;
            person.changeOverworld(destWorld);
        }
    }
    addWall(x, y) {
        this.walls[`${x},${y}`] = true;
    }
    removeWall(x, y) {
        delete this.walls[`${x},${y}`];
    }
    moveWall(wasX, wasY, direction) {
        this.removeWall(wasX, wasY);
        const { x, y } = nextPosition(wasX, wasY, direction);
        this.addWall(x, y)
    }
    toJSON() {
        let final = this.config
        final.id = this.id
        final.characters = []
        this.characters.forEach((char) => {
            final.characters.push(char.toJSON());
        })
        return final
    }
}

module.exports = Overworld;