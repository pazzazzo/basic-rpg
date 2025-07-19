import GameObject from "./GameObject.js";
import { nextPosition, withGrid } from "./Utils.js";

class Person extends GameObject {
    constructor(config, main, isMe) {
        super(config, main)
        this.movingProgressRemaining = 0;
        this.isPlayer = config.isPlayer || false
        this.isPlayerControlled = config.isPlayerControlled || false
        this.isMe = isMe

        this.peerId = config.peerId
        this.username = config.username || config.id
        this.directionUpdate = {
            "up": ["y", -1 / 16],
            "down": ["y", 1 / 16],
            "left": ["x", -1 / 16],
            "right": ["x", 1 / 16],
        }
        this.directionTeleport = {
            "up": ["y", -1],
            "down": ["y", 1],
            "left": ["x", -1],
            "right": ["x", 1],
        }

        /** @type {Object[]} */
        this.behaviors = new Array()

        if (!this.isMe) {
            this.nametag = document.createElement("div")
            this.nametag.classList.add("nametag")
            this.nametag.innerText = this.username

            this.main.ui.appendChild(this.nametag)
            setTimeout(() => {
                this.updateNametag()
            }, 10);
        } else {
            this.main.setMoneyRender(config.money)
        }

        this.main.map?.portals.forEach(p => {
            let s = p.speakers.get(this.id)
            if (s) {
                s.attach(this)
                this.speaker = s
                p.speakers.delete(this.id)
            }
        })
    }

    updateNametag() {
        if (this.nametag) {
            const x = ((this.x - (this.main.player.x) + .5) * 16 * 5 + Math.floor(this.main.canvas.width / 16) / 2 * 16 * 5)
            const y = ((this.y - (this.main.player.y) - .5) * 16 * 5 + Math.floor(this.main.canvas.height / 16) / 2 * 16 * 5)
            this.nametag.style.left = `${x}px`
            this.nametag.style.top = `${y}px`
        }
    }

    startBehavior(behavior) {
        this.facing = behavior.direction;
        if (behavior.type === "walk" && (behavior.timestamp ? behavior.timestamp >= this.main.lastBlur : true)) {
            if (this.isMe) {
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
            }
            this.overworld.moveWall(this.x, this.y, this.facing)
            this.updateServerCoord()
            this.movingProgressRemaining = behavior.run ? 8 : 16
            this.updateSprite()
            this.isMe && !behavior.serverCommand && !behavior.serverBroadcast && this.main.socket.emit("behavior", behavior, (...a) => { this.stopBehviaor(...a) });
            let t = nextPosition(this.x, this.y, this.facing);
            console.log(`Moving ${this.id} to (${t.x}, ${t.y}) facing ${this.facing} on ${this.main.map.id} with`, behavior);
        } else if (behavior.type === "walk") {
            this.overworld.moveWall(this.x, this.y, this.facing)
            this.updateServerCoord()
            this.teleportPosition()
        }

        if (behavior.type === "stand") {
            this.isStanding = true
            this.isMe && !behavior.serverCommand && !behavior.serverBroadcast && this.main.socket.emit("behavior", { serverCommand: true, ...behavior }, (...a) => { this.stopBehviaor(...a) });
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
            if (this.isMe && this.movingProgressRemaining === 0) {
                if (this.main.keyboardController.look && this.main.keyboardController.lookReaming > 0) {
                    this.startBehavior({ type: "stand", direction: this.main.keyboardController.look })
                    this.main.keyboardController.lookReaming--
                } else if (this.main.keyboardController.arrow) {
                    this.startBehavior({ type: "walk", direction: this.main.keyboardController.arrow })
                }
            }
            this.updateSprite()
        }
    }

    updatePosition() {
        const [property, change] = this.directionUpdate[this.facing]
        this[property] += change;
        this.movingProgressRemaining--;
        if (this.isMe) {
            this.main.map.characters.forEach(c => {
                if (c.speaker) {
                    c.speaker.update()
                    c.updateNametag()
                }
            })
        } else {
            this.speaker.update()
            this.updateNametag()
        }
    }
    teleportPosition() {
        const [property, change] = this.directionTeleport[this.facing]
        this[property] += change;
        if (this.isMe) {
            this.main.map.characters.forEach(c => {
                if (c.speaker) {
                    c.speaker.update()
                    c.updateNametag()
                }
            })
        } else {
            this.speaker.update()
            this.updateNametag()
        }
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