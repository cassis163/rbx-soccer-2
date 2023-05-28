import Timer from "shared/component/Timer";
import Stage from "./Stage";
import MatchTeam from "server/MatchTeam";

export default class FormationStage extends Stage {
    private readonly timer = new Timer(3);

    public async start(matchTeamA: MatchTeam, matchTeamB: MatchTeam): Promise<void> {
        print("Formation stage started");
        this.timer.start();
        this.timer.onTimeUp.Wait();
        this.timer.reset();
    }
}
