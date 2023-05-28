import Timer from "shared/component/Timer";
import Stage from "./Stage";

export default class IntermissionStage extends Stage {
    private readonly timer = new Timer(3);

    public async start(): Promise<void> {
        print("Intermission stage started");
        this.timer.start();
        this.timer.onTimeUp.Wait();
        this.timer.reset();
    }
}
