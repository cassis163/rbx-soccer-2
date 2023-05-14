import Ball from "./match/ball";

const ball = new Ball(new CFrame(0, 100, 0));
const part = ball.getPart();
part.ApplyImpulse(new Vector3(0, 0, 10000));
part.ApplyAngularImpulse(new Vector3(0, 20000, 0));
