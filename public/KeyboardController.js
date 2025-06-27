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

        document.addEventListener("keydown", (e) => {
            let k
            switch (e.key) {
                case "ArrowUp":
                    k = "up"
                    break;
                case "ArrowDown":
                    k = "down"
                    break;
                case "ArrowLeft":
                    k = "left"
                    break;
                case "ArrowRight":
                    k = "right"
                    break;
            }
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
            if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                let k
                switch (e.key) {
                    case "ArrowUp":
                        k = "up"
                        break;
                    case "ArrowDown":
                        k = "down"
                        break;
                    case "ArrowLeft":
                        k = "left"
                        break;
                    case "ArrowRight":
                        k = "right"
                        break;
                }
                this.arrows = this.arrows.filter(a => a !== k)
                this.arrow = this.arrows.length > 0 ? this.arrows[0] : null
            }
        });
    }
}

export default KeyboardController;