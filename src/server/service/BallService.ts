import { OnStart, Service } from "@flamework/core";
import { GlobalFunctions } from "shared/networking/BallNetworking";

@Service()
export default class BallService implements OnStart {
    onStart() {
        GlobalFunctions.server.kick.setCallback(
            (_player: Player, ballPart: BasePart, impulse: Vector3, position: Vector3) =>
                new Promise((resolve) => {
                    ballPart.AssemblyAngularVelocity = new Vector3();
                    ballPart.AssemblyLinearVelocity = new Vector3();
                    ballPart.ApplyImpulse(impulse);
                    resolve(true);
                }),
        );
    }
}
