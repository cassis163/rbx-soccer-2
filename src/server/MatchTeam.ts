import Signal from "@rbxts/signal";
import Goal from "./component/Goal";

export default class MatchTeam {
    public readonly onGoalConceded = new Signal<(ballPart: BasePart) => void>();

    private players: Player[] = [];
    private goalsScored = 0;

    public constructor(private readonly team: Team, private readonly goal: Goal) {
        goal.onGoalScored.Connect((ball) => this.onGoalConceded.Fire(ball));
    }

    public addPlayer(player: Player): void {
        this.players.push(player);
        player.Team = this.team;
    }

    public incrementGoalsScored(): void {
        this.goalsScored++;
    }

    public getGoalsScored(): number {
        return this.goalsScored;
    }

    public getGoal(): Goal {
        return this.goal;
    }

    public getTeam(): Team {
        return this.team;
    }
}
