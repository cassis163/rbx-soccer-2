import { Workspace } from "@rbxts/services";
import { BaseComponent, Component, Components } from "@flamework/components";
import { Dependency, OnInit } from "@flamework/core";
import Signal from "@rbxts/signal";
import Ball, { DIAMETER } from "./ball";

const components = Dependency<Components>();

export type OnGoalScoredCallback = (ball: Ball) => void;

type GoalAttributes = {
    team: Team;
};

@Component({
    tag: "Goal",
})
export default class Goal extends BaseComponent<GoalAttributes, Model> implements OnInit {
    public readonly onGoalScored = new Signal<OnGoalScoredCallback>();

    onInit() {
        const collisionPart = this.createCollisionPart();
        collisionPart.Touched.Connect((part) => this.onTouch(part));
        (this.instance.WaitForChild("Frame") as BasePart).BrickColor = this.attributes.team.TeamColor;
    }

    public getPosition(): Vector3 {
        return this.instance.GetBoundingBox()[0].Position;
    }

    public getTeam(): Team {
        return this.attributes.team;
    }

    private onTouch(part: BasePart) {
        const ballComponent = components.getComponent<Ball>(part);
        if (ballComponent === undefined) {
            return;
        }

        this.onGoalScored.Fire(ballComponent);
    }

    private createCollisionPart(): Part {
        const boundingBox = this.instance.GetBoundingBox();
        const offset = boundingBox[0].RightVector.mul(DIAMETER);
        const part = new Instance("Part");
        part.Size = boundingBox[1];
        part.CanCollide = false;
        part.Transparency = 1;
        part.Anchored = true;
        part.Locked = true;
        part.CFrame = boundingBox[0].add(offset);
        part.Parent = Workspace;

        return part;
    }
}
