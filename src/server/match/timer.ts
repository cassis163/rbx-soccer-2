import { Janitor } from "@rbxts/janitor";
import { RunService } from "@rbxts/services";

class Timer {
    private startTime;
    private time;
    private onTimeUp: () => void;
    private onChange: (time: number) => void;

    private janitor = new Janitor();

    constructor(
        startTime: number,
        onTimeUp: () => void,
        onChange = () => {
            return;
        },
    ) {
        this.startTime = startTime;
        this.time = startTime;
        this.onTimeUp = onTimeUp;
        this.onChange = onChange;
    }

    public start() {
        this.janitor.Add(
            RunService.Stepped.Connect((_, deltaTime) => {
                this.subtractTime(deltaTime);
            }),
        );
    }

    public stop() {
        this.janitor.Cleanup();
    }

    public reset() {
        this.time = this.startTime;
    }

    private subtractTime(deltaTime: number) {
        this.time = math.max(0, this.time - deltaTime);
        if (this.time === 0) {
            this.stop();
            this.onTimeUp();
        }

        this.onChange(this.time);
    }
}

export default Timer;
