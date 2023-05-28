import MatchTeam from "server/MatchTeam";

export default abstract class Stage {
    public abstract start(matchTeamA?: MatchTeam, matchTeamB?: MatchTeam): Promise<void>;
}
