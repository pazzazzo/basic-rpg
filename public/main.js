import { Overworld } from "./Overworld.js";
import { Person } from "./Person.js";

export class Main {
    constructor() {
        this.canvas = document.getElementsByTagName("canvas")[0]
        this.ctx = this.canvas.getContext("2d")
        this.overworld = new Overworld()
        this.socket = io({ auth: { username: (this.parseCookies()["username"] || false) } })

        this.socket.on("login", (callback) => {
            callback(prompt("username"))
        })
        this.socket.on("maps", (maps, player) => {
            window.OverworldMaps = maps
            for (const map in maps) {
                let gameObjects = maps[map].gameObjects
                for (const gameObject in gameObjects) {
                    window.OverworldMaps[map].gameObjects[gameObject] = new Person(gameObjects[gameObject])
                }
            }
            window.OverworldMaps[player.map].gameObjects["hero"] = new Person({
                isPlayerControlled: true,
                x: player.x,
                y: player.y,
                src: "./images/characters/people/hero.png"
            })
            this.overworld.init()
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
}