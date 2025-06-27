import KeyboardController from "./KeyboardController.js"
import Overworld from "./Overworld.js"
import Person from "./Person.js"
let updateRef
class Main {
    constructor(username, socket, peer) {
        /** @type {HTMLCanvasElement} */
        this.canvas = document.getElementById("game")

        /** @type {CanvasRenderingContext2DSettings} */
        this.ctx = this.canvas.getContext("2d")
        this.socket = socket
        this.peer = peer
        this.ready = false
        this.lastBlur = 0

        /** @type {HTMLDivElement} */
        this.ui = document.querySelector("#ui")

        /** @type {Overworld} */
        this.map = null

        /** @type {String} */
        this.username = username

        this._visibilityChange = this.visibilityChange.bind(this)

        document.addEventListener("visibilitychange", this._visibilityChange())

        this.peer.on('call', call => {
            call.answer(this.stream);
            console.log(call);

            call.on('stream', remoteStream => {
                console.log(remoteStream);
                if (this.map.characters.has("user:" + call.peer)) {
                    const p = this.map.characters.get("user:" + call.peer)
                    p.speaker.stream(remoteStream)
                    p.isCalling = true
                }
                // const audio = new Audio();
                // audio.srcObject = remoteStream;
                // audio.play();
            });
        });

        this.peer.on("open", (id) => {
            console.log("peer open", id);
            this.peerId = id
        })

        this.socket.emit("map", (map) => {
            this.map = new Overworld(map, this)

            console.log(map);

            /** @type {Person} */
            this.player = this.map.characters.get("user:" + this.username)
            this.keyboardController = new KeyboardController(this)
            this.startGameLoop()
            navigator.mediaDevices?.getUserMedia({ audio: true }).then(stream => {
                this.stream = stream
            });
            this.ready = true
        })
        this.socket.on("changeworld", (map) => {
            this.map.unmount()
            this.map = new Overworld(map, this)

            /** @type {Person} */
            this.player = this.map.characters.get("user:" + this.username)
            this.ready = true
        })

        this.socket.on("gameobject-behavior", (id, behavior) => {
            if (this.map.characters.has(id)) {
                const gameObject = this.map.characters.get(id);
                if (gameObject.id === this.username && !behavior.serverCommand) {
                    return
                }
                gameObject.behaviors.push({ ...behavior });
            }
        })

        this.socket.on("gameobject-unmount", (id) => {
            if (this.map.characters.has(id) && id !== this.username) {
                const gameObject = this.map.characters.get(id);
                gameObject.unmount();
                this.map.characters.delete(id);
            }
        })
        this.socket.on("gameobject-mount", (config) => {
            console.log("Mounting game object:", config.id);

            if (!this.map.characters.has(config.id) && config.id !== this.username) {
                this.map.addCharacter(config);
            }
        })

        this.socket.on("screen-update", (screen) => {
            if (!this.map) {
                return
            }
            const existingScreen = this.map.screens.find(s => s.id === screen.id);
            if (existingScreen) {
                existingScreen.img.src = 'data:image/png;base64,' + screen.src;
            } else {
                let img = new Image()
                img.src = 'data:image/png;base64,' + screen.src;
                this.map.screens.push({
                    id: screen.id,
                    img,
                    loaded: false,
                    x: screen.x || 0,
                    y: screen.y || 0
                });
            }
        })
    }
    init() {
        console.log("main init");
        this.resize()
        this._onResize = this.resize.bind(this);
        window.addEventListener("resize", this._onResize)
        console.log("main initied");
    }
    resize() {
        this.canvas.height = Math.round(innerHeight / 5)
        this.canvas.width = Math.round(innerWidth / 5)
        this.map?.characters.forEach(c => {
            c.updateNametag()
        })
    }
    visibilityChange () {
            if (!document.hidden) {
                this.lastBlur = Date.now()-2
            }
        }
    parseCookies(cookie = document.cookie) {
        let output = {};
        cookie.split(/\s*;\s*/).forEach(function (pair) {
            pair = pair.split(/\s*=\s*/);
            output[pair[0]] = pair.splice(1).join('=');
        });
        return output
    }
    startGameLoop() {
        const step = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            const cameraPerson = this.player

            this.map.characters.values().toArray().forEach(object => {
                object.update({
                    map: this.map,
                    playerArrow: this.keyboardController.arrow
                })
            })

            this.map.drawLowerImage(this.ctx, cameraPerson)
            this.map.drawScreens(this.ctx, cameraPerson, 0)

            this.map.characters.values().toArray().sort((a, b) => { return a.y - b.y }).forEach(object => {
                object.sprite.draw(this.ctx, cameraPerson)
            })


            this.map.drawUpperImage(this.ctx, cameraPerson)
            this.map.drawScreens(this.ctx, cameraPerson, 1)

            updateRef = requestAnimationFrame(() => { step(); })
        }
        step()
    }
    destroy() {
        cancelAnimationFrame(updateRef)
        document.removeEventListener("visibilitychange", this._visibilityChange);
        window.removeEventListener("resize", this._onResize);
        updateRef = null
        this.socket.removeAllListeners("changeworld");
        this.socket.removeAllListeners("gameobject-behavior");
        this.socket.removeAllListeners("gameobject-unmount");
        this.socket.removeAllListeners("gameobject-mount");
        this.socket.removeAllListeners("screen-update");
        this?.map.characters.forEach(c => {
            c.unmount()
        })
        for (const prop in this) {
            this[prop] = null
            delete this[prop]
        }
        window.__main = null
        delete window.__main
    }
}

export default Main;