import Main from "./Main.js";
import Overworld from "./Overworld.js";
import Sprite from "./Sprite.js";

class GameObject {
    constructor(config, main) {

        /** @type {Main} */
        this.main = main

        /** @type {String} */
        this.id = config.id || null;

        /** @type {number} */
        this.x = config.x || 0;

        /** @type {number} */
        this.y = config.y || 0;

        /** @type {String} */
        this.facing = config.facing || "down";
        
        /** @type {Sprite} */
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "./assets/none.png",
        })
        

        /** @type {Overworld} */
        this.overworld = null
    }

    /**
     * 
     * @param {Overworld} overworld 
     * @returns {GameObject}
     */
    mount(overworld) {
        this.overworld = overworld;
        overworld.characters.set(this.id, this);
        overworld.addWall(this.x, this.y);
        
        return this;
    }

    unmount() {
        if (this.overworld) {
            this.overworld.characters.delete(this.id);
            this.overworld.removeWall(this.x, this.y);
            this.overworld = null;
        }
        return this;
    }
}

export default GameObject;