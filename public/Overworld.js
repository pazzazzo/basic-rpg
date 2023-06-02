import { DirectionInput } from "./DirectionInput.js";
import { GameObject } from "./GameObject.js";
import { KeyPressListener } from "./KeyPressListener.js";
import { OverworldMap } from "./OverworldMap.js";

export class Overworld {
    constructor(config) {
        this.canvas = document.getElementsByTagName("canvas")[0]
        this.ctx = this.canvas.getContext("2d")
    }

    startGameLoop() {
        const step = () => {
            //Clear off the canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            //Etablish the camera person
            const cameraPerson = this.map.gameObjects.hero

            //Update all objects
            Object.values(this.map.gameObjects).forEach(object => {
                object.update({
                    arrow: this.directionInput.direction,
                    map: this.map
                })
            })

            // Draw Lower layer
            this.map.drawLowerImage(this.ctx, cameraPerson)

            //Draw Game Objects
            Object.values(this.map.gameObjects).sort((a, b) => {return a.y - b.y}).forEach(object => {
                object.sprite.draw(this.ctx, cameraPerson)
            })


            // Draw Upper layer
            this.map.drawUpperImage(this.ctx, cameraPerson)

            requestAnimationFrame(() => { step(); })
        }
        step()
    }

    bindActionInput() {
        new KeyPressListener("Enter", () => {
            //Is there a person here to talk to?
            this.map.checkForActionCutscene()
        })
    }

    init() {
        console.log("overworld init");
        this.map = new OverworldMap(window.OverworldMaps.DemoRoom)
        this.map.mountObjects()


        this.bindActionInput()

        this.directionInput = new DirectionInput().init()

        this.startGameLoop();

        // this.map.startCutscene([
        //     { who: "hero", type: "walk", direction: "down" },
        //     { who: "hero", type: "walk", direction: "down" },
        //     { who: "npcA", type: "walk", direction: "up" },
        //     { who: "npcA", type: "walk", direction: "left" },
        //     { who: "hero", type: "stand", direction: "right", time: 200 },
        //     { type: "textMessage", text: "Hello world!"},
        //     { who: "npcA", type: "walk", direction: "down" },
        //     { who: "npcA", type: "stand", direction: "up", time: 200 },
        // ])

        console.log("overworld initied");
    }

}