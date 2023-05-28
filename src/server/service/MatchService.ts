import { Components } from "@flamework/components";
import { OnStart, Service } from "@flamework/core";
import Maid from "@rbxts/maid";
import { Teams } from "@rbxts/services";
import MatchTeam from "server/MatchTeam";
import Goal from "server/component/Goal";
import FormationStage from "server/stage/FormationStage";
import IntermissionStage from "server/stage/IntermissionStage";
import MatchStage from "server/stage/MatchStage";
import PostMatchStage from "server/stage/PostMatchStage";

const TEAM_NAMES = ["Red", "Blue"];
const TEAM_BRICKCOLORS = [BrickColor.Red(), BrickColor.Blue()];

@Service()
export default class MatchService implements OnStart {
    private readonly formationStage = new FormationStage();
    private readonly matchStage = new MatchStage();
    private readonly postMatchStage = new PostMatchStage();
    private readonly intermissionStage = new IntermissionStage();

    private goalA!: Goal;
    private goalB!: Goal;

    constructor(private readonly components: Components) {}

    onStart() {
        this.initializeGoals();
        this.startMatchLoop();
    }

    private initializeGoals() {
        const goals = this.components.getAllComponents<Goal>();
        this.goalA = goals[0];
        this.goalB = goals[1];
    }

    private startMatchLoop() {
        const maid = new Maid();
        const doMatchCycle = async () => {
            const teamA = this.createTeam(TEAM_NAMES[0], TEAM_BRICKCOLORS[0]);
            maid.GiveTask(teamA);
            const matchTeamA = new MatchTeam(teamA, this.goalA);
            const teamB = this.createTeam(TEAM_NAMES[1], TEAM_BRICKCOLORS[1]);
            maid.GiveTask(teamB);
            const matchTeamB = new MatchTeam(teamB, this.goalB);

            const formationStagePromise = this.formationStage.start(matchTeamA, matchTeamB).catch(error);
            const matchStagePromise = formationStagePromise
                .andThen(() => this.matchStage.start(matchTeamA, matchTeamB))
                .catch(error);
            const postMatchStagePromise = matchStagePromise
                .andThen(() => this.postMatchStage.start(matchTeamA, matchTeamB))
                .catch(error);
            const intermissionStagePromise = postMatchStagePromise
                .andThen(() => this.intermissionStage.start())
                .catch(error);

            intermissionStagePromise
                .then(() => {
                    maid.DoCleaning();
                    doMatchCycle();
                })
                .catch(error);
        };

        doMatchCycle();
    }

    private createTeam(name: string, color: BrickColor): Team {
        const team = new Instance("Team");
        team.Name = name;
        team.AutoAssignable = false;
        team.TeamColor = color;
        team.Parent = Teams;

        return team;
    }
}
