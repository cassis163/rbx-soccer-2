import { Controller, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { GlobalFunctions } from "shared/networking/BallNetworking";

@Controller()
export default class BallController implements OnStart {
    private player = Players.LocalPlayer;
    private debounce = false;

    onStart(): void {
        this.player.CharacterAdded.Connect((character) => {
            wait(1);
            this.initializeCharacter(character);
        });
    }

    private initializeCharacter(character: Model) {
        character
            .GetDescendants()
            .filter((descendant) => descendant.IsA("BasePart"))
            .forEach((part) =>
                (part as BasePart).Touched.Connect((touchedPart) => this.onTouch(part as BasePart, touchedPart)),
            );
    }

    private onTouch(part: BasePart, touchedPart: BasePart) {
        if (this.debounce || touchedPart.Name !== "Ball") {
            return;
        }

        this.debounce = true;
        print("Kick");
        const magnitude = 8e2;
        const direction = touchedPart.Position.sub(part.Position.sub(new Vector3(0, 1, 0))).Unit;
        const impulse = direction.mul(magnitude);
        // const position = part.Position.add(touchedPart.Position).div(2).sub(new Vector3(0, 1, 0));
        const position = touchedPart.Position.sub(new Vector3(0, 2, 0));

        // touchedPart.ApplyImpulseAtPosition(impulse, position);
        GlobalFunctions.client.kick(touchedPart, impulse, position).then((didKick) => print(`Did kick: ${didKick}`));
        wait(0.5);
        this.debounce = false;
    }
}
