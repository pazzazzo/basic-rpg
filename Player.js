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
    constructor(config, socket, server) {
        super(config, server)
        this.username = config._id.replace("user:", "")
        console.log(`New player: ${this.username} (${socket.id})`);
        this.socket = socket
        this.server = server
        this.money = config.money
        this.skin = config.skin || "hero"
        this.isPlayer = true
        this.mount(server.overworlds.get(config.map))
        socket.join(this.overworld.id)
        server.players.set(this.username, this)

        socket.on("map", (cb) => {
            cb(this.overworld.toJSON())
        })

        socket.on("behavior", (behavior, cb) => {
            behavior.timestamp = Date.now()
            this.startBehavior(behavior, cb)
        })

        socket.on("disconnect", () => {
            server.players.delete(this.username)
            this.unmount({name: "disconnect"})
        })

    }
    toJSON() {
        return {
            id: this.id,
            peerId: this.username,
            x: this.x,
            y: this.y,
            facing: this.facing,
            src: `./assets/characters/people/${this.skin}.png`,
            world: this.overworld.id,
            isPlayer: true,
            username: this.username,
            money: this.money ?? 50
        };
    }
}