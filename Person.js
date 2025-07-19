/**
 * @typedef {import('./Server')} Server
 * @typedef {import('./Overworld')} Overworld
 */

const { nextPosition } = require('./Utils');

class Person {
    constructor(config, server) {

        /** @type {Server} */
        this.server = server

        /** @type {String} */
        this.id = config._id || null;

        /** @type {number} */
        this.x = config.x || 0;

        /** @type {number} */
        this.y = config.y || 0;

        /** @type {boolean} */
        this.isPlayer = false

        this.directionUpdate = {
            "up": ["y", -1],
            "down": ["y", 1],
            "left": ["x", -1],
            "right": ["x", 1],
        }

        /** @type {String} */
        this.facing = config.facing || "down";

        /** @type {String} */
        this.src = config.src || "./assets/none.png";

        /** @type {Overworld} */
        this.overworld = null
    }

    /**
     * 
     * @param {Overworld} overworld 
     * @returns {Person}
     */
    mount(overworld) {
        this.overworld = overworld;
        overworld.characters.set(this.id, this);
        overworld.addWall(this.x, this.y);
        this.server.io.to(overworld.id).emit("gameobject-mount", this.toJSON())
        return this;
    }

    /**
     * 
     * @returns {Person}
     */
    unmount(reason) {
        this.overworld.characters.delete(this.id);
        this.overworld.removeWall(this.x, this.y);
        this.server.io.to(this.overworld.id).emit("gameobject-unmount", this.id, reason);
        this.overworld = null;

        return this;
    }

    changeOverworld(overworld) {
        this.isPlayer && this.socket && this.socket.leave(this.overworld.id);
        this.unmount({"name": "changeworld", x: this.x, y: this.y, facing: this.facing});
        this.mount(overworld);
        if (this.isPlayer && this.socket) {
            this.socket.join(overworld.id);
            this.socket.emit("changeworld", overworld.toJSON());
            this.startBehavior({
                type: "walk",
                direction: this.facing,
                serverCommand: true,
            })

        }
    }

    startBehavior(behavior, cb) {
        this.facing = behavior.direction;
        if (behavior.type === "walk") {
            if (this.overworld.isPortal(this.x, this.y, this.facing)) {
                console.log("Portal found, teleporting...");
                this.overworld.removeWall(this.x, this.y);
                this.updatePosition()
                behavior.pos = { x: this.x, y: this.y }
                if (this.socket && !behavior.serverCommand) {
                    this.server.io.to(this.overworld.id).except(this.socket.id).emit("gameobject-behavior", this.id, behavior)
                } else {
                    this.server.io.to(this.overworld.id).emit("gameobject-behavior", this.id, behavior)
                }
                this.overworld.usePortal(this.x, this.y, this.facing, this);
                return;
            }
            if (this.overworld.isSpaceTaken(this.x, this.y, this.facing)) {

                console.log(`${this.id} tried to move from (${this.x}, ${this.y}) facing ${this.facing}`);
                behavior.retry && setTimeout(() => {
                    this.startBehavior(behavior)
                }, 10);
                behavior.type = "stand"
                if (typeof cb === "function") {
                    cb(behavior, this.x, this.y, this.facing);
                }
                this.startBehavior(behavior)
                return
            }
            this.overworld.moveWall(this.x, this.y, this.facing)
            this.updatePosition()
            behavior.pos = { x: this.x, y: this.y }
            console.log(`Moving ${this.id} to (${this.x}, ${this.y}) facing ${this.facing}`);
            if (this.socket && !behavior.serverCommand) {
                this.server.io.to(this.overworld.id).except(this.socket.id).emit("gameobject-behavior", this.id, behavior)
            } else {
                this.server.io.to(this.overworld.id).emit("gameobject-behavior", this.id, behavior)
            }
        }

        if (behavior.type === "stand") {
            this.isStanding = true
            setTimeout(() => {
                this.isStanding = false
            }, behavior.time);

            this.server.io.to(this.overworld.id).emit("gameobject-behavior", this.id, behavior)
        }
    }

    updatePosition() {
        const [property, change] = this.directionUpdate[this.facing]
        this[property] += change;
    }

    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            facing: this.facing,
            src: this.src,
            world: this.overworld.id
        };
    }
}

module.exports = Person;