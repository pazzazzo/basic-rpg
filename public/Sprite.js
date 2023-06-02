import { GameObject } from "./GameObject.js";
import { withGrid } from "./utils.js";

export class Sprite {
    constructor(config) {

        //Set up the image
        this.image = new Image()
        this.image.src = config.src;
        this.image.onload = () => {
            this.isLoaded = true
        }
        this.image.onerror = () => {
            this.image.src = "./images/none.png";
        }

        //Shadow
        this.shadow = new Image();
        this.useShadow = true; //config.useShadow || false
        if (this.useShadow) {
            this.shadow.src = "./images/characters/shadow.png";
        }
        this.shadow.onload = () => {
            this.isShadowLoaded = true
        }

        //Configure Animation & Initial State
        this.animations = config.animations || {
            "idle-up": [[0, 2]],
            "idle-down": [[0, 0]],
            "idle-right": [[0, 1]],
            "idle-left": [[0, 3]],
            "walk-down": [[1, 0], [0, 0], [3, 0], [0, 0]],
            "walk-right": [[1, 1], [0, 1], [3, 1], [0, 1]],
            "walk-up": [[1, 2], [0, 2], [3, 2], [0, 2]],
            "walk-left": [[1, 3], [0, 3], [3, 3], [0, 3]],
        }
        this.currentAnimation = "idle-down" // config.currentAnimation || "idle-down"
        this.currentAnimationFrame = 0;
        this.animationFrameLimit = config.animationFrameLimit || 8;
        this.animationFrameProgress = this.animationFrameLimit

        //Reference the game object
        this.gameObject = config.gameObject
    }

    get frame() {
        return this.animations[this.currentAnimation][this.currentAnimationFrame]
    }

    setAnimation(key) {
        if (this.currentAnimation !== key) {
            this.currentAnimation = key;
            this.currentAnimationFrame = 0;
            this.animationFrameProgress = this.animationFrameLimit;
        }
    }

    updateAnimationProgress() {
        if (this.animationFrameProgress > 0) {
            this.animationFrameProgress--
            return
        }

        this.animationFrameProgress = this.animationFrameLimit
        this.currentAnimationFrame++

        if (!this.frame) {
            this.currentAnimationFrame = 0
        }
    }

    draw(ctx = new CanvasRenderingContext2D(), cameraPerson = new GameObject()) {
        const x = this.gameObject.x - 8 + withGrid(Math.floor(ctx.canvas.width/16)/2) - cameraPerson.x;
        const y = this.gameObject.y - 18 + withGrid(Math.floor(ctx.canvas.height/16)/2) - cameraPerson.y;

        this.isShadowLoaded && ctx.drawImage(this.shadow, x, y)

        const [frameX, frameY] = this.frame

        this.isLoaded && ctx.drawImage(this.image,
            frameX * 32, frameY * 32,
            32, 32,
            x, y,
            32, 32
        )
        this.updateAnimationProgress()
    }
}