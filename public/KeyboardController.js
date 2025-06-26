import Main from "./Main.js";

class KeyboardController {
    /**
     * @param {Main} main 
     */
    constructor(main) {
        this.main = main;
        this.arrow = null

        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowUp") {
                this.arrow = "up";
            } else if (e.key === "ArrowDown") {
                this.arrow = "down";
            } else if (e.key === "ArrowLeft") {
                this.arrow = "left";
            } else if (e.key === "ArrowRight") {
                this.arrow = "right";
            }
        });

        document.addEventListener("keyup", (e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
                this.arrow = null;
            }
        });
    }
}

export default KeyboardController;