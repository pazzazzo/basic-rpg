const Server = require("./Server")

module.exports = class Player {
    constructor (username, socket, server = new Server()) {
        this.username = username
        this.socket = socket
        this.server = server

        socket.emit("maps", server.database.maps, server.database.players[username])
    }
}