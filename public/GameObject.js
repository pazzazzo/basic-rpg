import Main from "./Main.js";
import Overworld from "./Overworld.js";
import Speaker from "./Speaker.js";
import Sprite from "./Sprite.js";
import { nextPosition } from "./Utils.js";

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

        /** @type {number} */
        this.serverX = config.x || 0;

        /** @type {number} */
        this.serverY = config.y || 0;

        /** @type {String} */
        this.facing = config.facing || "down";

        if (!config.invisible) {
            /** @type {Sprite} */
            this.sprite = new Sprite({
                gameObject: this,
                src: config.src || "./assets/none.png",
            })
        }

        /** @type {Speaker} */
        this.speaker = new Speaker({ gameObject: this })


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

        if (this.peerId && !this.isCalling && this?.username !== this.main.username && this.main.stream) {
            const call = this.main.peer.call(this.peerId, this.main.stream);
            console.log(call, this.peerId, this.id);
            call.on("stream", (remoteStream) => {
                this.speaker.stream(remoteStream)
                console.log(remoteStream);
            })
        }

        return this;
    }

    unmount() {
        if (this.overworld) {
            if (this.speaker) {
                this.speaker.close()
            }
            if (this.nametag) {
                this.nametag.remove()
            }
            
            this.overworld.characters.delete(this.id);
            this.overworld.removeWall(this.serverX, this.serverY);
            
            this.overworld = null;
        }
        return this;
    }

    updateServerCoord() {
        const {x, y} = nextPosition(this.x, this.y, this.facing)
        this.serverX = x
        this.serverY = y
    }
}

export default GameObject;