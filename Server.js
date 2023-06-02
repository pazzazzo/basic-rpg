const { withGrid } = require('./utils.js');
const { readFileSync, writeFileSync } = require('fs');
const express = require('express');
const http = require('http');
const IOServer = require("socket.io").Server;
const Player = require('./Player.js');

module.exports = class Server {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new IOServer(this.server);
        this.port = 3000

        this.database = JSON.parse(readFileSync(__dirname + "/database.json").toString())
        this.users = new Set()

        this.app.use(express.static("public"))

        this.io.on('connection', (socket) => {
            if (socket.handshake.auth.username && this.database.players[socket.handshake.auth.username]) {
                let player = new Player(socket.handshake.auth.username, socket, this)
                return
            }
            socket.emit("login", (username) => {
                if (this.database.players[username]) {
                    let player = new Player(username, socket, this)
                } else {
                    this.database.players[username] = {
                        x: withGrid(5),
                        y: withGrid(6)
                    }
                    this.save()
                    let player = new Player(username, socket, this)
                }
            })
        })

        this.server.listen(this.port, () => {
            console.log(`App onlone at :${this.port} 🟢`)
        })
    }
    save() {
        writeFileSync(__dirname + "/database.json", JSON.stringify(this.database))
    }
}