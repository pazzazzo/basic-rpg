import { OverworldEvent } from "./OverworldEvent.js";
import { Sprite } from "./Sprite.js";

export class GameObject {
    constructor (config) {
        this.id = null
        this.isMounted = false
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.direction = config.direction || "down"
        this.sprite = new Sprite({
            gameObject: this,
            src: config.src || "./images/none.png",
        });

        this.behaviorLoop = config.behaviorLoop || []
        this.behaviorLoopIndex = 0

        this.talking = config.talking || [];
    }
    mount(map) {
        this.isMounted = true;
        map.addWall(this.x, this.y)

        setTimeout(() => {
            this.doBehaviorEvent(map)
        }, 10);
    }
    update() {

    }

    async doBehaviorEvent(map) {

        //Don't do anything if there is a more important cutscene or I don't have config to do anything anyway
        if (map.isCutscenePlaying || this.behaviorLoop.length === 0 || this.isStanding) {
            return;
        }

        //Setting up our event with relevant info
        let eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
        eventConfig.who = this.id;

        //Create an event instance out of our next event config
        const eventHandler = new OverworldEvent({map, event: eventConfig});
        await eventHandler.init();

        //Settng the next event to fire
        this.behaviorLoopIndex ++;
        if (this.behaviorLoopIndex === this.behaviorLoop.length) {
            this.behaviorLoopIndex = 0;
        }

        //do it again
        this.doBehaviorEvent(map)
    }
}