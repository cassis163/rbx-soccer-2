import Ball from "./ball";
import Goal from "./goal";
import MatchTeam from "./team";
import TeamsManager from "./teamsManager";
import Timer from "./timer";

// Match -> post match (celebrate) -> intermission -> ... (repeat)

export enum TeamId {
    A,
    B,
}

const MATCH_DURATION = 60;
const POST_MATCH_DURATION = 20;
const INTERMISSION_DURATION = 10;
const GOAL_DURATION = 5;

class Match {
    private isPlaying = false;

    private matchTimer = new Timer(MATCH_DURATION, () => this.startPostMatch());
    private postMatchTimer = new Timer(POST_MATCH_DURATION, () => this.startIntermission());
    private intermissionTimer = new Timer(INTERMISSION_DURATION, () => this.startMatch());

    private teamAScore = 0;
    private teamBScore = 0;

    private teamA: MatchTeam;
    private teamB: MatchTeam;

    private teamsManager: TeamsManager;

    private ball?: Ball;

    private teamAGoal: Goal;
    private teamBGoal: Goal;

    constructor(teamAGoal: Goal, teamBGoal: Goal, teamATeam: Team, teamBTeam: Team) {
        this.teamAGoal = teamAGoal;
        this.teamBGoal = teamBGoal;
        this.teamA = new MatchTeam(TeamId.A, teamATeam);
        this.teamB = new MatchTeam(TeamId.B, teamBTeam);
        this.teamsManager = new TeamsManager(this.teamA, this.teamB);
    }

    public startMatch() {
        this.matchTimer.reset();
        this.teamsManager.setTeams();
        this.doKickOff();
    }

    public startPostMatch() {
        this.postMatchTimer.reset();
        this.isPlaying = false;
        this.postMatchTimer.start();
    }

    public startIntermission() {
        this.teamsManager.resetTeams();
        this.intermissionTimer.reset();
        this.intermissionTimer.start();
    }

    public onGoalScored(teamId: TeamId) {
        if (!this.isPlaying) return;

        this.matchTimer.stop();
        this.isPlaying = false;
        this.incrementScore(teamId);
        wait(GOAL_DURATION);
        this.doKickOff();
    }

    public partIsMatchBall(part: BasePart): boolean {
        return this.ball?.getPart() === part;
    }

    public getTeamAScore() {
        return this.teamAScore;
    }

    public getTeamBScore() {
        return this.teamBScore;
    }

    private incrementScore(team: TeamId) {
        switch (team) {
            case TeamId.A:
                this.teamAScore++;
                break;
            case TeamId.B:
                this.teamBScore++;
                break;
        }
    }

    private doKickOff() {
        const centerPosition = this.teamAGoal.getPosition().add(this.teamBGoal.getPosition()).div(2);
        const teamAOffsetPosition = centerPosition.add(this.teamAGoal.getPosition()).div(2);
        const teamBOffsetPosition = centerPosition.add(this.teamBGoal.getPosition()).div(2);

        this.teamA.spawn(centerPosition, teamAOffsetPosition);
        this.teamB.spawn(centerPosition, teamBOffsetPosition);

        this.ball?.destroy();
        this.ball = new Ball(new CFrame(centerPosition));

        this.matchTimer.start();
        this.isPlaying = true;
    }
}

export default Match;
