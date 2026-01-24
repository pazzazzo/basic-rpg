import Main from "./Main.js";

class Settings {
    /**
     * @param {Main} main 
     * @param {*} config 
     */
    constructor(main) {
        this.main = main;
        main.socket.emit("config.get", (config) => {
            console.log(config);
            this.keybind = config.keybind
        })
    }
}

export default Settings;