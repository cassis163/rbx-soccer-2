import { Players } from "@rbxts/services";
import MatchTeam from "./team";

class TeamsManager {
    private teamA: MatchTeam;
    private teamB: MatchTeam;

    constructor(teamA: MatchTeam, teamB: MatchTeam) {
        this.teamA = teamA;
        this.teamB = teamB;
    }

    public setTeams() {
        const players = Players.GetPlayers();
        const middleIndex = math.floor(players.size() / 2);

        const teamAPlayers: Player[] = [];
        const teamBPlayers: Player[] = [];
        players.forEach((player, index) => {
            if (index < middleIndex) {
                teamAPlayers.push(player);
            } else {
                teamBPlayers.push(player);
            }
        });

        this.teamA.setPlayers(teamAPlayers);
        this.teamB.setPlayers(teamBPlayers);
    }

    public resetTeams() {
        const players = Players.GetPlayers();
        players.forEach((player) => {
            player.Team = undefined;
        });

        this.teamA.setPlayers([]);
        this.teamB.setPlayers([]);
    }
}

export default TeamsManager;
