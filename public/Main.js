import KeyboardController from "./KeyboardController.js"
import Overworld from "./Overworld.js"
import Person from "./Person.js"

class Main {
    constructor() {
        this.canvas = document.getElementsByTagName("canvas")[0]
        this.ctx = this.canvas.getContext("2d")
        this.socket = io({ auth: { username: (this.parseCookies()["username"] || false) } })
        this.ready = false

        /** @type {Overworld} */
        this.map = null

        /** @type {String} */
        this.username = this.parseCookies()["username"] || null

        this.socket.on("login", (callback) => {
            while (!this.username) {
                this.username = prompt("username")
            }
            callback(this.username)
        })
        this.socket.once("map", (map) => {
            this.map = new Overworld(map, this)

            console.log(map);

            /** @type {Person} */
            this.player = this.map.characters.get(this.username)
            this.player.isPlayerControlled = true
            this.keyboardController = new KeyboardController(this)
            this.startGameLoop()
            this.ready = true
        })
        this.socket.on("changeworld", (map) => {
            this.map = new Overworld(map, this)

            console.log(map);

            /** @type {Person} */
            this.player = this.map.characters.get(this.username)
            this.player.isPlayerControlled = true
            this.ready = true
        })

        this.socket.on("gameobject-behavior", (id, behavior) => {
            if (this.map.characters.has(id)) {
                const gameObject = this.map.characters.get(id);
                if (gameObject.id === this.username && !behavior.serverCommand) {
                    return
                }
                gameObject.behaviors.push(behavior);
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
        window.addEventListener("resize", () => this.resize())
        console.log("main initied");
    }
    resize() {
        this.canvas.height = Math.round(innerHeight / 5)
        this.canvas.width = Math.round(innerWidth / 5)
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

            const cameraPerson = this.map.characters.get(this.username)

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

            requestAnimationFrame(() => { step(); })
        }
        step()
    }
}

export default Main;