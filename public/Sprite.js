import GameObject from "./GameObject.js";
import { withGrid } from "./Utils.js";

class Sprite {
    constructor(config) {

        this.image = new Image()
        this.image.src = config.src || "./assets/none.png";

        this.image.onload = () => {
            this.isLoaded = true
        }
        this.image.onerror = () => {
            this.image.src = "./assets/none.png";
        }

        this.shadow = new Image();
        this.useShadow = typeof config.useShadow === "boolean" ? config.useShadow : true;
        if (this.useShadow) {
            this.shadow.src = "./assets/characters/shadow.png";
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
        this.currentAnimation = typeof config.currentAnimation === "string" ? config.currentAnimation : "idle-down";
        this.currentAnimationFrame = 0;
        this.animationFrameLimit = config.animationFrameLimit || 8;
        this.animationFrameProgress = this.animationFrameLimit

        /** @type {GameObject} */
        this.gameObject = config.gameObject;
    }

    get frame() {
        try {
            this.animations[this.currentAnimation][this.currentAnimationFrame]
        } catch (error) {
            console.log(this.animations, this.currentAnimation, this.currentAnimationFrame);
        }
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
        const x = withGrid(this.gameObject.x) - 8 + withGrid(Math.floor(ctx.canvas.width / 16) / 2) - withGrid(cameraPerson.x);
        const y = withGrid(this.gameObject.y) - 18 + withGrid(Math.floor(ctx.canvas.height / 16) / 2) - withGrid(cameraPerson.y);

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

export default Sprite;