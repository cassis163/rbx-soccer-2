import { Workspace } from "@rbxts/services";
import { DIAMETER as BALL_DIAMETER } from "server/match/ball";
import Match, { TeamId } from ".";

class Goal {
    private teamId: TeamId;
    private team: Team;
    private goal: Model;
    private collisionPart: Part;

    private match?: Match;

    constructor(goal: Model, teamId: TeamId, team: Team) {
        this.team = team;
        this.teamId = teamId;
        this.goal = goal;
        this.collisionPart = this.createCollisionPart();

        this.initialize();
    }

    public getPosition(): Vector3 {
        return this.goal.GetBoundingBox()[0].Position;
    }

    public setMatch(match: Match) {
        this.match = match;
    }

    private initialize() {
        this.collisionPart.Touched.Connect((part) => this.onTouch(part));
        (this.goal.WaitForChild("Frame") as BasePart).BrickColor = this.team.TeamColor;
    }

    private onTouch(part: BasePart) {
        if (this.match?.partIsMatchBall(part)) this.match.onGoalScored(this.teamId);
    }

    private createCollisionPart(): Part {
        const boundingBox = this.goal.GetBoundingBox();
        const offset = boundingBox[0].RightVector.mul(BALL_DIAMETER);
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

export default Goal;
