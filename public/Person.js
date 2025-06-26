import GameObject from "./GameObject.js";
import { nextPosition } from "./Utils.js";

class Person extends GameObject {
    constructor(config, main) {
        super(config, main)
        this.movingProgressRemaining = 0;
        this.isPlayerControlled = config.isPlayerControlled || false
        this.directionUpdate = {
            "up": ["y", -1 / 16],
            "down": ["y", 1 / 16],
            "left": ["x", -1 / 16],
            "right": ["x", 1 / 16],
        }

        /** @type {Object[]} */
        this.behaviors = new Array()
    }

    startBehavior(behavior) {
        this.facing = behavior.direction;
        if (behavior.type === "walk") {
            if (this.id === this.main.username) {
                if (this.overworld.isPortal(this.x, this.y, this.facing) && !behavior.thoughtPortal) {
                    this.overworld.usePortal(this.x, this.y, this.facing, this);
                    return;
                }
                if (this.overworld.isSpaceTaken(this.x, this.y, this.facing)) {
                    behavior.retry && setTimeout(() => {
                        this.startBehavior(behavior)
                    }, 10);
                    return
                }

                this.overworld.moveWall(this.x, this.y, this.facing)
                this.movingProgressRemaining = 16
                this.updateSprite()
                !behavior.serverCommand && this.main.socket.emit("behavior", behavior, (...a) => {this.stopBehviaor(...a)});
            } else {
                this.overworld.moveWall(this.x, this.y, this.facing)
                this.movingProgressRemaining = 16
                this.updateSprite()
            }
            let t = nextPosition(this.x, this.y, this.facing);
            console.log(`Moving ${this.id} to (${t.x}, ${t.y}) facing ${this.facing}`);
        }

        if (behavior.type === "stand") {
            this.isStanding = true
            setTimeout(() => {
                this.isStanding = false
            }, behavior.time);
        }
    }

    update() {
        if (this.movingProgressRemaining > 0) {
            this.updatePosition()
        } else {
            if (this.behaviors.length > 0) {
                const nextBehavior = this.behaviors.shift();
                this.startBehavior(nextBehavior);
            }
            if (this.isPlayerControlled && this.main.keyboardController.arrow && this.movingProgressRemaining === 0) {
                this.startBehavior({type: "walk", direction: this.main.keyboardController.arrow})
            }
            this.updateSprite()
        }
    }

    updatePosition() {
        const [property, change] = this.directionUpdate[this.facing]
        this[property] += change;
        this.movingProgressRemaining--;
    }

    updateSprite() {
        if (this.movingProgressRemaining > 0) {
            this.sprite.setAnimation(`walk-${this.facing}`)
            return;
        }
        this.sprite.setAnimation(`idle-${this.facing}`)
    }
    stopBehviaor(behavior, x, y, facing) {
        this.x = x;
        this.y = y;
        this.facing = facing;
        this.movingProgressRemaining = 0;
        this.updateSprite();
    }
}

export default Person;