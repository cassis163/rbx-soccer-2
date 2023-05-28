import Timer from "shared/component/Timer";
import Stage from "./Stage";
import MatchTeam from "server/MatchTeam";
import Maid from "@rbxts/maid";
import { ServerStorage, Workspace } from "@rbxts/services";

const GOAL_INTERVAL = 3;

export default class MatchStage extends Stage {
    private readonly timer = new Timer(30);
    private readonly maid = new Maid();

    private ballPart?: BasePart;

    constructor() {
        super();
    }

    public async start(matchTeamA: MatchTeam, matchTeamB: MatchTeam): Promise<void> {
        print("Match stage started");
        this.doKickoff(matchTeamA, matchTeamB);
        this.maid.GiveTask(
            matchTeamA.onGoalConceded.Connect((ballPart: BasePart) =>
                this.onGoalScored(matchTeamB, matchTeamA, ballPart),
            ),
        );
        this.maid.GiveTask(
            matchTeamB.onGoalConceded.Connect((ballPart: BasePart) =>
                this.onGoalScored(matchTeamA, matchTeamB, ballPart),
            ),
        );
        this.timer.onTimeUp.Wait();
        this.timer.reset();
        this.maid.DoCleaning();
    }

    private onGoalScored(scoringMatchTeam: MatchTeam, concedingMatchTeam: MatchTeam, ballPart: BasePart) {
        if (this.ballPart !== ballPart) return;

        print(`${scoringMatchTeam.getTeam().Name} scored!`);
        scoringMatchTeam.incrementGoalsScored();
        this.timer.stop();
        wait(GOAL_INTERVAL);
        this.doKickoff(scoringMatchTeam, concedingMatchTeam);
    }

    private doKickoff(matchTeamA: MatchTeam, matchTeamB: MatchTeam) {
        this.timer.start();
        this.ballPart?.Destroy();
        this.spawnBall(matchTeamA, matchTeamB);
    }

    private spawnBall(matchTeamA: MatchTeam, matchTeamB: MatchTeam) {
        const goalAPosition = matchTeamA.getGoal().getPosition();
        const goalBPosition = matchTeamB.getGoal().getPosition();
        const ballPosition = goalAPosition.add(goalBPosition).div(2);

        this.ballPart = ServerStorage.WaitForChild("Ball").Clone() as BasePart;
        this.ballPart.CFrame = new CFrame(ballPosition);
        this.ballPart.Parent = Workspace;

        const ballDiameter = this.ballPart.Size.X;

        matchTeamA.getGoal().initialize(ballDiameter, matchTeamA.getTeam());
        matchTeamB.getGoal().initialize(ballDiameter, matchTeamB.getTeam());
    }
}
