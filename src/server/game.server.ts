import { Teams, Workspace } from "@rbxts/services";
import Match, { TeamId } from "./match";
import Goal from "./match/goal";

const dome = Workspace.WaitForChild("Dome");
const goalA = dome.WaitForChild("GoalA") as Model;
const goalB = dome.WaitForChild("GoalB") as Model;

const teamATeam = Teams.WaitForChild("TeamA") as Team;
const teamBTeam = Teams.WaitForChild("TeamB") as Team;

const teamAGoal = new Goal(goalA, TeamId.A, teamATeam);
const teamBGoal = new Goal(goalB, TeamId.B, teamBTeam);

const match = new Match(teamAGoal, teamBGoal, teamATeam, teamBTeam);

wait(5);
teamAGoal.setMatch(match);
teamBGoal.setMatch(match);
match.startMatch();
