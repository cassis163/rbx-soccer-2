import Maid from "@rbxts/maid";
import { RunService } from "@rbxts/services";
import Signal from "@rbxts/signal";

export default class Timer {
    public readonly onTimeUp = new Signal();
    public readonly onChange = new Signal<(time: number) => void>();

    private readonly maid = new Maid();

    private readonly startTime;
    private time;

    constructor(startTime: number) {
        this.startTime = startTime;
        this.time = startTime;
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
            this.onTimeUp.Fire();
        }

        this.onChange.Fire(this.time);
    }
}
