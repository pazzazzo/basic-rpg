import GameObject from "./GameObject.js";
import Main from "./Main.js";
import Speaker from "./Speaker.js";

/**
 * @typedef {Object} PortalConfig
 * @property {number} x - Portal destination x
 * @property {number} y - Portal destination y
 * 
 */

class Portal extends GameObject {
    /**
     * 
     * @param {PortalConfig} config 
     * @param {String} key 
     * @param {Main} main 
     */
    constructor(config, key, main) {
        super({x: key.split(",")[0], y: key.split(",")[1], id: "portal:" + key, invisible: true}, main)

        this.destMap = config.dest

        /** @type {Map<String, Speaker>} */
        this.speakers = new Map()
    }
}

export default Portal