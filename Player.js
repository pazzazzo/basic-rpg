const { Socket } = require("socket.io")
const Server = require("./Server")
const Person = require("./Person")

module.exports = class Player extends Person {
    /**
     * @extends Person
     * @param {String} username 
     * @param {Socket} socket 
     * @param {Server} server 
     */
    constructor(username, socket, server) {
        super({ id: username, ...server.database.players[username] }, server)
        console.log(`New player: ${username} (${socket.id})`);
        this.username = username
        this.socket = socket
        this.server = server
        this.skin = server.database.players[username].skin || "hero"
        this.isPlayer = true
        this.mount(server.overworlds.get(server.database.players[username].map))
        socket.join(this.overworld.id)

        socket.emit("map", this.overworld.toJSON())
        socket.to(this.overworld.id).emit("gameobject-mount", this.toJSON())

        socket.on("behavior", (behavior, cb) => {
            this.startBehavior(behavior, cb)
        })

        socket.on("disconnect", () => {
            this.unmount()
        })

    }
    toJSON() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            facing: this.facing,
            src: `./assets/characters/people/${this.skin}.png`,
            world: this.overworld.id,
            isPlayer: true,
            username: this.username
        };
    }
}