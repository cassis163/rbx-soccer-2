import { BaseComponent, Component } from "@flamework/components";
import { RunService } from "@rbxts/services";

@Component()
export default class Timer extends BaseComponent {
    private startTime;
    private time;
    private onTimeUp: () => void;
    private onChange: (time: number) => void;

    constructor(
        startTime: number,
        onTimeUp: () => void,
        onChange = () => {
            return;
        },
    ) {
        super();

        this.startTime = startTime;
        this.time = startTime;
        this.onTimeUp = onTimeUp;
        this.onChange = onChange;
    }

    public start() {
        this.maid.GiveTask(
            RunService.Stepped.Connect((_, deltaTime) => {
                this.subtractTime(deltaTime);
            }),
        );
    }

    public stop() {
        this.maid.DoCleaning();
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
