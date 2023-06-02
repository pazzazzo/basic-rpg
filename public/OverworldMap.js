import { GameObject } from "./GameObject.js";
import { OverworldEvent } from "./OverworldEvent.js";
import { Person } from "./Person.js";
import { asGridCoord, nextPosition, withGrid } from "./utils.js";

export class OverworldMap {
    constructor(config) {
        this.gameObjects = config.gameObjects;
        this.walls = config.walls || {}

        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        this.isCutscenePlaying = false;
    }

    drawLowerImage(ctx = new CanvasRenderingContext2D(), cameraPerson = new GameObject()) {
        ctx.drawImage(
            this.lowerImage,
            withGrid(Math.floor(ctx.canvas.width / 16) / 2) - cameraPerson.x,
            withGrid(Math.floor(ctx.canvas.height / 16) / 2) - cameraPerson.y
        )
    }
    drawUpperImage(ctx = new CanvasRenderingContext2D(), cameraPerson = new GameObject()) {
        ctx.drawImage(this.upperImage,
            withGrid(Math.floor(ctx.canvas.width / 16) / 2) - cameraPerson.x,
            withGrid(Math.floor(ctx.canvas.height / 16) / 2) - cameraPerson.y
        )
    }

    isSpaceTaken(currentX, currentY, direction) {
        const { x, y } = nextPosition(currentX, currentY, direction)
        return this.walls[`${x},${y}`] || false
    }

    mountObjects() {
        Object.keys(this.gameObjects).forEach(key => {

            let object = this.gameObjects[key]
            object.id = key


            //TODO: determine if this object should actually mount
            object.mount(this)
        })
    }

    async startCutscene(events) {
        this.isCutscenePlaying = true;

        for (let i = 0; i < events.length; i++) {
            const eventHandler = new OverworldEvent({
                event: events[i],
                map: this
            })
            await eventHandler.init();
        }

        this.isCutscenePlaying = false;

        //Reset NPCs to do their idle behavior
        Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
    }

    checkForActionCutscene() {
        const hero = this.gameObjects["hero"];
        const nextCoords = nextPosition(hero.x, hero.y, hero.direction)
        const match = Object.values(this.gameObjects).find(object => {
            return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`
        })
        console.log(match);
        if (!this.isCutscenePlaying && match && match.talking.length) {
            this.startCutscene(match.talking[0].events)
        }
    }

    addWall(x, y) {
        this.walls[`${x},${y}`] = true;
    }
    removeWall(x, y) {
        delete this.walls[`${x},${y}`];
    }
    moveWall(wasX, wasY, direction) {
        this.removeWall(wasX, wasY);
        const { x, y } = nextPosition(wasX, wasY, direction);
        this.addWall(x, y)
    }
}
// window.OverworldMaps = {
//     DemoRoom: {
//         lowerSrc: "./images/maps/DemoLower.png",
//         upperSrc: "./images/maps/DemoUpper.png",
//         gameObjects: {
//             hero: new Person({
//                 isPlayerControlled: true,
//                 x: withGrid(5),
//                 y: withGrid(6),
//                 src: "./images/characters/people/hero.png"
//             }),
//             npcA: new Person({
//                 x: withGrid(7),
//                 y: withGrid(9),
//                 src: "./images/characters/people/npc1.png",
//                 behaviorLoop: [
//                     { type: "stand", direction: "left", time: 800 },
//                     { type: "stand", direction: "up", time: 800 },
//                     { type: "stand", direction: "right", time: 1200 },
//                     { type: "stand", direction: "up", time: 300 },
//                 ],
//                 talking: [
//                     {
//                         events: [
//                             { type: "textMessage", text: "Hello world!", faceHero: "npcA" },
//                             { type: "textMessage", text: "Go away!" },
//                         ]
//                     }
//                 ]
//             }),
//             npcB: new Person({
//                 x: withGrid(3),
//                 y: withGrid(7),
//                 src: "./images/characters/people/npc2.png",
//                 behaviorLoop: [
//                     { type: "walk", direction: "left" },
//                     { type: "stand", direction: "up", time: 800 },
//                     { type: "walk", direction: "up" },
//                     { type: "walk", direction: "right" },
//                     { type: "walk", direction: "down" },
//                 ]
//             })
//         },
//         walls: {
//             [asGridCoord(7, 6)]: true,
//             [asGridCoord(8, 6)]: true,
//             [asGridCoord(7, 7)]: true,
//             [asGridCoord(8, 7)]: true,
//         }
//     },
//     Street: {
//         lowerSrc: "./images/maps/StreetLower.png",
//         upperSrc: "./images/maps/StreetUpper.png",
//         gameObjects: {
//             hero: new Person({
//                 isPlayerControlled: true,
//                 x: withGrid(5),
//                 y: withGrid(10),
//                 src: "./images/characters/people/hero.png"
//             }),
//             npc1: new Person({
//                 x: withGrid(7),
//                 y: withGrid(10),
//                 src: "./images/characters/people/npc1.png"
//             })
//         }
//     }
// }