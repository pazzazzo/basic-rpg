import GameObject from "./GameObject.js";
import Main from "./Main.js";

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
        super({}, main)
    }
}

export default Portal