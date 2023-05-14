import { TeamId } from ".";

const SPAWN_ARC = math.pi / 4;

class MatchTeam {
    private players: Player[] = [];

    private teamId: TeamId;
    private teamInstance: Team;

    constructor(teamId: TeamId, teamInstance: Team) {
        this.teamId = teamId;
        this.teamInstance = teamInstance;
    }

    public spawn(centerPosition: Vector3, offsetPosition: Vector3) {
        this.players.forEach((player, index) => {
            const rootPart = player.Character?.FindFirstChild("HumanoidRootPart") as BasePart | undefined;
            if (!rootPart) {
                return;
            }

            if (this.players.size() === 1) {
                rootPart.CFrame = new CFrame(offsetPosition, centerPosition);
            } else {
                const offset = centerPosition.sub(offsetPosition);
                const rotation = (SPAWN_ARC / (this.players.size() - 1)) * index - SPAWN_ARC / 2;
                const sine = math.sin(rotation);
                const cosine = math.cos(rotation);
                const rotationCFrame = new CFrame(0, 0, 0, cosine, 0, sine, 0, 1, 0, -sine, 0, cosine);
                const rotatedOffset = rotationCFrame.VectorToWorldSpace(offset);

                rootPart.CFrame = new CFrame(centerPosition.add(rotatedOffset), centerPosition);
            }
        });
    }

    public setPlayers(players: Player[]) {
        this.players = players;
        this.players.forEach((player) => (player.Team = this.teamInstance));
    }

    public getTeamId() {
        return this.teamId;
    }
}

export default MatchTeam;
