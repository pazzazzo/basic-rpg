import GameObject from "./GameObject.js";

/**
 * @typedef {Object} SpeakerConfig
 * @property {GameObject} gameObject    - attached GameObject
 * 
 */

class Speaker {
    /**
     * 
     * @param {SpeakerConfig} config 
     */
    constructor(config) {
        /** @type {GameObject} */
        this.gameObject = config.gameObject

        /** @type {Audio} */
        this.audio = new Audio()

        /** @type {AudioContext} */
        this.context = new (window.AudioContext || window.webkitAudioContext)();

        /** @type {BiquadFilterNode} */
        this.lowpass = this.context.createBiquadFilter()
        this.lowpass.type = "lowpass";
        this.lowpass.frequency.value = 20000;
        this.lowpass.Q.value = 1;

        /** @type {GainNode} */
        this.gainNode = this.context.createGain()
        this.gainNode.gain.value = 1

        /** @type {StereoPannerNode} */
        this.panner = this.context.createStereoPanner()
        this.panner.pan.value = 0
    }

    /**
     * Attach speaker to a media stream
     * @param {MediaProvider} stream 
     */
    stream(stream) {
        this.audio.srcObject = stream

        /** @type {MediaElementAudioSourceNode} */
        this.source = this.context.createMediaElementSource(this.audio)

        this.source.connect(this.lowpass);
        this.lowpass.connect(this.gainNode);
        this.gainNode.connect(this.panner);
        this.panner.connect(this.context.destination);

        this.audio.play()
    }

    /**
     * Update the speaker position
     */
    update() {
        const x = (this.gameObject.x - this.gameObject.main.player.x) * 10
        const y = (this.gameObject.y - this.gameObject.main.player.y) * 10
        const distance = Math.sqrt(x * x + y * y);
        this.gainNode.gain.value = Math.max(0.05, 1 - distance / 100);
        this.panner.pan.value = Math.max(-1, Math.min(1, x / 30));
        // this.lowpass.frequency.value = muffled ? 800 : 20000;
    }

    /**
     * Add a mp3 source to the speaker
     * @param {String} url 
     */
    src(url) {
        this.audio.src = url

        /** @type {MediaElementAudioSourceNode} */
        this.source = this.context.createMediaElementSource(this.audio)

        this.source.connect(this.lowpass);
        this.lowpass.connect(this.gainNode);
        this.gainNode.connect(this.panner);
        this.panner.connect(this.context.destination);

        this.audio.play()
    }

    /**
     * Attach a GameObject to the speaker
     * @param {GameObject} gameObject 
     * @returns {Speaker}
     */
    attach(gameObject) {
        this.gameObject = gameObject
        return this
    }

    close() {
        this.audio.pause()
    }
}

export default Speaker