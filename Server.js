const { withGrid } = require('./Utils.js');
const { readFileSync, writeFileSync } = require('fs');
const express = require('express');
const http = require('http');
const IOServer = require("socket.io").Server;
const Player = require('./Player.js');
const Overworld = require('./Overworld.js');
const ngrok = require('@ngrok/ngrok');
const os = require("os")
const PouchDB = require('pouchdb');
const { ExpressPeerServer } = require("peer");
const { createHash } = require('crypto');
const CommandManager = require('./CommandsManager.js');

require('dotenv').config()

const { NGROK_AUTH_TOKEN } = process.env;

module.exports = class Server {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new IOServer(this.server);
        this.port = 3000

        this.peerServer = ExpressPeerServer(this.server, {
            debug: true,
            path: "/"
        });

        this.database = new PouchDB('./database');

        this.links = []

        this.players = new Map()

        this.overworlds = new Map();

        this.commandManager = new CommandManager(this)

        this.database.get("worldlist").then(v => {
            v.data.forEach(async worldID => {
                let world = await this.database.get(worldID)
                this.overworlds.set(worldID, new Overworld(world, this))
                console.log(`${worldID} loaded`);
            })
        })
        if (process.env.NODE_ENV !== 'test') {
            let i = 0
            setInterval(() => {
                let imglist = [
                    "iVBORw0KGgoAAAANSUhEUgAAABgAAAAJCAIAAACnn3uRAAAAAXNSR0IArs4c6QAAAHlJREFUKJFjTGDnZ6AGYGFgYJi/fh2Fptj7+bLc+/sbwlHOKmdgYLg7rRPOhnDhbKyycCkmZIORtd2d1glXB2GgyaI5iokBB1DOKkd2C0HAgksC0078AMVFylnlcP34XYQpxWjHwrWjp58kyzGBR0khox0LF4WmQAAASPQt0A9kuaAAAAAASUVORK5CYII=",
                    "iVBORw0KGgoAAAANSUhEUgAAABgAAAAJCAYAAAAo/ezGAAAAAXNSR0IArs4c6QAAAHhJREFUOE9jTGDn/89AQ8AIsmD++nU0scLez5eB0Y6F6//BTZsZlLPKGe5O60ShYbYii8PEYOqR+ciuBOkhaAFIET4DccnDLMewAN3FID7MEGwuJtkC9CCiug8IxQE2H8J8CfIhzjjY0dNPk1TkUVIISUU0MR1qKADmmYDXdECiiwAAAABJRU5ErkJggg=="
                ]
                i = (i + 1) % imglist.length
                this.io.to("world:DemoRoom").emit("screen-update", {
                    id: "demoScreen",
                    src: imglist[i],
                })
            }, 1000);
        }

        this.app.use("/", express.static("public"))
        this.app.use("/peerjs", this.peerServer)

        this.io.on('connection', async (socket) => {
            console.log(`New connection from ${socket.id}`);
            let userData = await this.tryGet("user:" + socket.handshake.auth.username)

            socket.emit("links", this.links)

            socket.on("login", async ({ username, password }, cb) => {
                userData = await this.tryGet("user:" + username)
                if (userData) {
                    if (userData.password !== this.hashPassword(password)) {
                        cb({
                            ok: false,
                            message: "Incorrect password.",
                            incorrect: ["password-inp"]
                        })
                    } else if (this.players.has(username)) {
                        cb({
                            ok: false,
                            message: "A session is already present on your account."
                        })
                    } else {
                        let player = new Player(userData, socket, this)
                        cb({ ok: true })
                        this.onNewPlayer(player)
                    }
                } else {
                    cb({
                        ok: false,
                        message: "This user doen't exist.",
                        incorrect: ["username-inp"]
                    })
                }
            })
            socket.on("register", async ({ username, password, skin }, cb) => {
                userData = await this.tryGet("user:" + username)
                if (userData) {
                    cb({
                        ok: false,
                        message: "This user already exist.",
                        incorrect: ["register-username-inp"]
                    })
                } else {
                    let user = {
                        _id: `user:${username}`,
                        x: 5,
                        y: 6,
                        map: "world:DemoRoom",
                        password: this.hashPassword(password),
                        skin: skin,
                        isPlayer: true,
                        money: 50
                    }
                    let r = await this.database.put(user)
                    console.log(`Create user ${username}: ${r.ok ? "Success" : "Failed"}`);

                    let player = new Player(user, socket, this)
                    cb({ ok: true })
                    this.onNewPlayer(player)
                }
            })


            socket.on("disconnect", () => {
                console.log(`Disconnection from ${socket.id}`);
            })
        })

        if (process.env.NODE_ENV !== 'test') {
            this.server.listen(this.port, async () => {
                console.log(`App online at http://localhost:${this.port} 🟢`)
                if (process.env.online) {
                    const url = (await ngrok.connect({ addr: this.port, authtoken: NGROK_AUTH_TOKEN })).url()
                    console.log(`App online at ${url} 🟢`);
                    this.links.push(url)
                }
                const interfaces = os.networkInterfaces();
                Object.keys(interfaces).forEach((iface) => {
                    interfaces[iface].forEach((address) => {
                        if (address.family === 'IPv4' && !address.internal) {
                            const url = `http://${address.address}:${this.port}`
                            console.log(`App online at ${url} 🟢`);
                            this.links.push(url)
                        }
                    });
                });
            })
        }
    }
    onNewPlayer(player) {

    }

    /**
     * Génère le hash d'un mot de passe.
     * @param {string} plainPassword - Le mot de passe en clair.
     * @returns {String} - Le hash à stocker en base.
     */
    hashPassword(plainPassword) {
        return createHash('sha256')
            .update(plainPassword + process.env.SALT)
            .digest('hex');
    }

    async tryGet(id) {
        try {
            let u = await this.database.get(id);
            return u;
        } catch (err) {
            return undefined;
        }
    }
}