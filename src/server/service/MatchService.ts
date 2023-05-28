import { OnStart, Service } from "@flamework/core";
import IntermissionStage from "server/stage/IntermissionStage";
import MatchStage from "server/stage/MatchStage";
import PostMatchStage from "server/stage/PostMatchStage";

@Service()
export default class MatchService implements OnStart {
    private readonly matchStage = new MatchStage();
    private readonly postMatchStage = new PostMatchStage();
    private readonly intermissionStage = new IntermissionStage();

    onStart() {
        this.startMatchLoop();
    }

    private startMatchLoop() {
        const doMatchCycle = () => {
            const matchStagePromise = this.matchStage.start();
            const postMatchStagePromise = matchStagePromise.andThen(() => this.postMatchStage.start());
            const intermissionStagePromise = postMatchStagePromise.andThen(() => this.intermissionStage.start());
            intermissionStagePromise.then(() => doMatchCycle());
        };

        doMatchCycle();
    }
}
