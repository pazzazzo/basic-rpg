const { withGrid } = require('./Utils.js');
const { readFileSync, writeFileSync } = require('fs');
const express = require('express');
const http = require('http');
const IOServer = require("socket.io").Server;
const Player = require('./Player.js');
const Overworld = require('./Overworld.js');
const ngrok = require('@ngrok/ngrok');
const os = require("os")

require('dotenv').config()

const { NGROK_AUTH_TOKEN } = process.env;

module.exports = class Server {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new IOServer(this.server);
        this.port = 3000

        this.database = JSON.parse(readFileSync(__dirname + "/database.json").toString())

        this.overworlds = new Map();

        for (const mapId in this.database.maps) {
            this.overworlds.set(mapId, new Overworld({ id: mapId, ...this.database.maps[mapId] }, this))
        }
        let i = 0
        setInterval(() => {
            let imglist = [
                "iVBORw0KGgoAAAANSUhEUgAAABgAAAAJCAIAAACnn3uRAAAAAXNSR0IArs4c6QAAAHlJREFUKJFjTGDnZ6AGYGFgYJi/fh2Fptj7+bLc+/sbwlHOKmdgYLg7rRPOhnDhbKyycCkmZIORtd2d1glXB2GgyaI5iokBB1DOKkd2C0HAgksC0078AMVFylnlcP34XYQpxWjHwrWjp58kyzGBR0khox0LF4WmQAAASPQt0A9kuaAAAAAASUVORK5CYII=",
                "iVBORw0KGgoAAAANSUhEUgAAABgAAAAJCAYAAAAo/ezGAAAAAXNSR0IArs4c6QAAAHhJREFUOE9jTGDn/89AQ8AIsmD++nU0scLez5eB0Y6F6//BTZsZlLPKGe5O60ShYbYii8PEYOqR+ciuBOkhaAFIET4DccnDLMewAN3FID7MEGwuJtkC9CCiug8IxQE2H8J8CfIhzjjY0dNPk1TkUVIISUU0MR1qKADmmYDXdECiiwAAAABJRU5ErkJggg=="
            ]
            i = (i + 1) % imglist.length
            this.io.to("DemoRoom").emit("screen-update", {
                id: "demoScreen",
                src: imglist[i],
            })
        }, 1000);

        this.app.use(express.static("public"))

        this.io.on('connection', (socket) => {
            console.log(`New connection from ${socket.id}`);

            if (socket.handshake.auth.username && this.database.players[socket.handshake.auth.username]) {
                let player = new Player(socket.handshake.auth.username, socket, this)
                this.onNewPlayer(player)
                return
            }
            socket.emit("login", (username) => {
                if (this.database.players[username]) {
                    let player = new Player(username, socket, this)
                    this.onNewPlayer(player)
                } else {
                    this.database.players[username] = {
                        x: 5,
                        y: 6,
                        map: "DemoRoom",
                        skin: "hero",
                        isPlayer: true
                    }
                    this.save()
                    let player = new Player(username, socket, this)
                    this.onNewPlayer(player)
                }
                socket.request.headers['set-cookie'] = `username=${username}; Path=/; HttpOnly; SameSite=Strict`
            })

            socket.on("disconnect", () => {
                console.log(`Disconnection from ${socket.id}`);
            })
        })

        this.server.listen(this.port, async () => {
            console.log(`App online at http://localhost:${this.port} 🟢`)
            // const url = (await ngrok.connect({ addr: this.port, authtoken: NGROK_AUTH_TOKEN })).url()
            // console.log(`App online at ${url} 🟢`);
            const interfaces = os.networkInterfaces();
            Object.keys(interfaces).forEach((iface) => {
                interfaces[iface].forEach((address) => {
                    if (address.family === 'IPv4' && !address.internal) {
                        console.log(`App online at http://${address.address}:${this.port} 🟢`);
                    }
                });
            });

        })
    }
    onNewPlayer(player) {

    }
    save() {
        writeFileSync(__dirname + "/database.json", JSON.stringify(this.database))
    }
}