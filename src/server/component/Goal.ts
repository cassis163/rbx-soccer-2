import { BaseComponent, Component, Components } from "@flamework/components";
import Signal from "@rbxts/signal";
import Ball from "./Ball";

@Component({
    tag: "Goal",
})
export default class Goal extends BaseComponent<{}, Model> {
    public readonly onGoalScored = new Signal<(ballPart: BasePart) => void>();

    constructor(private readonly components: Components) {
        super();
    }

    public initialize(ballDiameter: number, team: Team) {
        this.maid.DoCleaning();
        const collisionPart = this.createCollisionPart(ballDiameter);
        this.maid.GiveTask(collisionPart);
        this.maid.GiveTask(collisionPart.Touched.Connect((part) => this.onTouch(part)));
        (this.instance.WaitForChild("Frame") as BasePart).BrickColor = team.TeamColor;
    }

    public getPosition(): Vector3 {
        return this.instance.GetBoundingBox()[0].Position;
    }

    private onTouch(part: BasePart) {
        const ballComponent = this.components.getComponent<Ball>(part);
        if (ballComponent === undefined) {
            return;
        }

        this.onGoalScored.Fire(part);
    }

    private createCollisionPart(ballDiameter: number): Part {
        const boundingBox = this.instance.GetBoundingBox();
        const offset = boundingBox[0].RightVector.mul(ballDiameter);
        const part = new Instance("Part");
        part.Size = boundingBox[1];
        part.CanCollide = false;
        part.Transparency = 1;
        part.Anchored = true;
        part.Locked = true;
        part.CFrame = boundingBox[0].add(offset);
        part.Parent = this.instance;

        return part;
    }
}
