import Main from "./Main.js";

class KeyboardController {
    /**
     * @param {Main} main 
     */
    constructor(main) {
        this.main = main;
        this.arrow = null
        this.look = null
        this.arrows = []
        this.lookReaming = 0
        this.isEnterPressed = false
        this.actions = {
            "menu.resume": () => {
                main.ui.querySelector("#menu").classList.toggle("hidden")
            }
        }

        this.keydownListener = (e) => {
            let keybind = main.settings.keybind[e.key]
            if (keybind) {
                if (keybind.startsWith("dir.")) {
                    let k = keybind.replace("dir.", "")
                    if (this.look !== k && this.arrows.length === 0) {
                        this.lookReaming = 5
                        this.look = k
                    }
                    this.arrows.push(k);
                    this.arrow = this.arrows[0]
                } else {
                    main.socket.emit("gui.open", keybind)
                }
            } else {
                switch (e.key) {
                    case "Escape":
                        main.ui.querySelector("#menu").classList.toggle("hidden")
                        break;
                    case "Enter":
                        if (!this.isEnterPressed) {
                            main.mainAction()
                        }
                        this.isEnterPressed = true
                        break;
                }
            }
            console.log(e.key);
        }

        this.keyupListener = (e) => {
            let keybind = main.settings.keybind[e.key]
            if (keybind) {
                if (keybind.startsWith("dir.")) {
                    let k = keybind.replace("dir.", "")
                    this.arrows = this.arrows.filter(a => a !== k)
                    this.arrow = this.arrows.length > 0 ? this.arrows[0] : null
                }
            } else {
                switch (e.key) {
                    case "Enter":
                        this.isEnterPressed = false
                        break;
                }
            }
        }


        document.addEventListener("keydown", this.keydownListener);
        document.addEventListener("keyup", this.keyupListener);
    }
    stop() {
        document.removeEventListener("keydown", this.keydownListener);
        document.removeEventListener("keyup", this.keyupListener);
    }
}

export default KeyboardController;