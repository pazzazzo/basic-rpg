import GameObject from "./GameObject.js";
import Main from "./Main.js";
import Person from "./Person.js";
import Portal from "./Portal.js";
import { nextPosition, withGrid } from "./Utils.js";

/**
 * @typedef {{ id: string, src: string, x: number, y: number, side: 0|1, img: undefined|Image }} ScreenObject
 * 
 */

class Overworld {
    constructor(config, main = new Main) {
        this.main = main
        this.config = config;

        this.id = config.id || null;

        /** @type {Map<String, Person>} */
        this.characters = new Map();

        /** @type {Image} */
        this.lowerImage = new Image();
        this.lowerImage.src = config.lowerSrc;

        /** @type {Image} */
        this.upperImage = new Image();
        this.upperImage.src = config.upperSrc;

        /** @type {Object} */
        this.walls = config.walls || {};


        /** @type {ScreenObject[]} */
        this.screens = config.screens || [];

        /** @type {Map<String, GameObject>} */
        this.portals = new Map();

        for (const key in config.portals) {
            this.portals.set(key, new Portal(config.portals[key], key, main))
        }

        config.characters.forEach(character => {
            this.addCharacter(character)
        })

        this.screens.forEach((screen, i) => {
            let img = new Image();
            img.src = 'data:image/png;base64,' + screen.src;
            this.screens[i].img = img;
            img.onload = () => {
                this.screens[i].loaded = true;
            }
        })
    }

    isPortal(currentX, currentY, direction) {
        const { x, y } = nextPosition(currentX, currentY, direction)
        return this.portals.has(`${x},${y}`)
    }

    /**
     * 
     * @param {number} currentX 
     * @param {number} currentY 
     * @param {string} direction 
     * @param {Person} person 
     */
    usePortal(currentX, currentY, direction, person) {
        person.startBehavior({
            type: "walk",
            direction: direction,
            thoughtPortal: true
        })
        this.main.keyboardController.arrow = null
    }

    addCharacter(config) {
        new Person(config, this.main, config.username == this.main.username).mount(this)
    }

    unmount() {
        this.characters.forEach(c => {
            c.unmount()
        })
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {GameObject} cameraPerson 
     */
    drawLowerImage(ctx, cameraPerson) {
        ctx.drawImage(
            this.lowerImage,
            withGrid(Math.floor(ctx.canvas.width / 16) / 2) - withGrid(cameraPerson.x),
            withGrid(Math.floor(ctx.canvas.height / 16) / 2) - withGrid(cameraPerson.y)
        )
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {GameObject} cameraPerson 
     */
    drawUpperImage(ctx, cameraPerson) {
        ctx.drawImage(this.upperImage,
            withGrid(Math.floor(ctx.canvas.width / 16) / 2) - withGrid(cameraPerson.x),
            withGrid(Math.floor(ctx.canvas.height / 16) / 2) - withGrid(cameraPerson.y)
        )
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     * @param {GameObject} cameraPerson 
     */
    drawScreens(ctx, cameraPerson, side) {
        this.screens.forEach(screen => {
            if (screen.side === side) {
                const x = withGrid(Math.floor(ctx.canvas.width / 16) / 2) - withGrid(cameraPerson.x) + screen.x;
                const y = withGrid(Math.floor(ctx.canvas.height / 16) / 2) - withGrid(cameraPerson.y) + screen.y;
                ctx.drawImage(screen.img, x, y)
            }
        })
    }

    isSpaceTaken(currentX, currentY, direction) {
        const { x, y } = nextPosition(currentX, currentY, direction)
        return this.walls[`${x},${y}`] || false
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

export default Overworld;