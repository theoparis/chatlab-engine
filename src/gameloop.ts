import mitt from "mitt";

export class GameLoop {
    protected msLastFrame: number;
    readonly emitter = mitt<{
        frame: { deltaTime: number };
    }>();
    protected isActive: boolean;
    protected fps = 0;
    protected msFpsLimit: number;

    constructor(fps: number) {
        this.msLastFrame = 0;
        this.isActive = false;
        this.fps = 0;

        if (!fps && fps > 0) this.msFpsLimit = 1000 / fps;
        else this.msFpsLimit = 0;
    }

    run() {
        if (!this.fps && this.fps > 0) {
            const msCurrent = performance.now();
            const msDelta = msCurrent - this.msLastFrame;
            const deltaTime = msDelta / 1000.0;

            if (msDelta >= this.msFpsLimit) {
                this.fps = Math.floor(1 / deltaTime);
                this.msLastFrame = msCurrent;
                this.emitter.emit("frame", { deltaTime });
            }

            if (this.isActive) requestAnimationFrame(this.run.bind(this));
        } else {
            const msCurrent = performance.now();
            const deltaTime = (msCurrent - this.msLastFrame) / 1000.0;

            // Time it took to generate one frame, divide 1 by that to get how many frames in one second
            this.fps = Math.floor(1 / deltaTime);
            this.msLastFrame = msCurrent;
            this.emitter.emit("frame", { deltaTime });

            if (this.isActive) requestAnimationFrame(this.run.bind(this));
        }
    }

    start() {
        this.isActive = true;
        this.msLastFrame = performance.now();
        window.requestAnimationFrame(this.run.bind(this));
        return this;
    }

    stop() {
        this.isActive = false;
    }
}
