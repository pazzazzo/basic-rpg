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

        document.addEventListener("keydown", (e) => {
            let k
            switch (e.key) {
                case "z":
                    k = "up"
                    break;
                case "s":
                    k = "down"
                    break;
                case "q":
                    k = "left"
                    break;
                case "d":
                    k = "right"
                    break;
                case "Enter":
                    if (!this.isEnterPressed) {
                        main.mainAction()
                    }
                    this.isEnterPressed = true
                    break;
            }
            console.log(e.key);

            if (k) {
                if (this.look !== k && this.arrows.length === 0) {
                    this.lookReaming = 5
                    this.look = k
                }
                this.arrows.push(k);
                this.arrow = this.arrows[0]
            }
        });

        document.addEventListener("keyup", (e) => {
            let k
            switch (e.key) {
                case "z":
                    k = "up"
                    break;
                case "s":
                    k = "down"
                    break;
                case "q":
                    k = "left"
                    break;
                case "d":
                    k = "right"
                    break;
                case "Enter":
                    this.isEnterPressed = false
                    break;
            }
            if (k) {
                this.arrows = this.arrows.filter(a => a !== k)
                this.arrow = this.arrows.length > 0 ? this.arrows[0] : null
            }
        });
    }
}

export default KeyboardController;