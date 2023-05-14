import { Janitor } from "@rbxts/janitor";
import { RunService, ServerStorage, Workspace } from "@rbxts/services";
import DestructableEntity from "shared/destructableEntity";

export const DIAMETER = 3;

const STUDS_PER_METER = 35 / 9.8;

const AIR_DENSITY = 1.225;
const SURFACE_AREA = math.pi * (DIAMETER / 2) ** 2;
const TEMPERATURE_IN_KELVIN = 294;

const VISCOSITY = 1.458e-6 * (TEMPERATURE_IN_KELVIN ** 1.5 / (TEMPERATURE_IN_KELVIN + 110.4));

const DRAG_MULTIPLIER = 1;
const MAGNUS_MULTIPLIER = DRAG_MULTIPLIER;

const createBall = (): BasePart => {
    return ServerStorage.WaitForChild("Ball").Clone() as BasePart;
};

class Ball implements DestructableEntity {
    private janitor = new Janitor();

    private part: BasePart = this.janitor.Add(createBall());
    private dragForce = new Instance("VectorForce");
    private magnusForce = new Instance("VectorForce");

    constructor(cframe: CFrame) {
        this.setCFrame(cframe);
        this.part.Parent = Workspace;
        this.initializePhysics();
    }

    public setCFrame(cframe: CFrame) {
        this.part.CFrame = cframe;
        this.part.AssemblyLinearVelocity = Vector3.zero;
        this.part.AssemblyAngularVelocity = Vector3.zero;
    }

    public getPart(): BasePart {
        return this.part;
    }

    public destroy() {
        this.janitor.Destroy();
    }

    private initializePhysics() {
        const attachment = new Instance("Attachment");
        attachment.Parent = this.part;

        this.dragForce.Force = Vector3.zero;
        this.dragForce.RelativeTo = Enum.ActuatorRelativeTo.World;
        this.dragForce.Attachment0 = attachment;
        this.dragForce.Parent = this.part;
        this.magnusForce.Force = Vector3.zero;
        this.magnusForce.RelativeTo = Enum.ActuatorRelativeTo.World;
        this.magnusForce.Attachment0 = attachment;
        this.magnusForce.Parent = this.part;

        this.janitor.Add(RunService.PreSimulation.Connect(() => this.updatePhysics()));
    }

    private updatePhysics() {
        this.dragForce.Force = this.getDragForce();
        this.magnusForce.Force = this.getMagnusForce();
    }

    private getMagnusForce() {
        const velocity = this.part.AssemblyLinearVelocity.Magnitude;
        const magnusCoefficient = this.getMagnusCoefficient();
        const magnitude = 0.5 * magnusCoefficient * AIR_DENSITY * velocity ** 2 * SURFACE_AREA;

        const linearVelocity = this.part.AssemblyLinearVelocity;
        const angularVelocity = this.part.AssemblyAngularVelocity;
        if (linearVelocity.Magnitude === 0 || angularVelocity.Magnitude === 0) return Vector3.zero;

        const direction = angularVelocity.Cross(linearVelocity);

        if (direction.Magnitude === 0) return Vector3.zero;

        return direction.Unit.mul(magnitude * MAGNUS_MULTIPLIER);
    }

    private getMagnusCoefficient() {
        // Coefficient is based on metric system, so convert from studs to meters

        const velocity = this.part.AssemblyLinearVelocity.Magnitude / STUDS_PER_METER;
        if (velocity === 0) return 0;

        const angularVelocity = this.part.AssemblyAngularVelocity.Magnitude / STUDS_PER_METER;

        return 0.385 * (((DIAMETER / 2 / STUDS_PER_METER) * angularVelocity) / velocity) ** 0.25;
    }

    private getDragForce() {
        const reynoldsNumber = this.getReynoldsNumber();
        const dragCoefficient = this.getDragCoefficient(reynoldsNumber);
        const velocity = this.part.AssemblyLinearVelocity.Magnitude;
        const magnitude = 0.5 * AIR_DENSITY * velocity ** 2 * SURFACE_AREA * dragCoefficient;
        const negativeVelocity = this.part.AssemblyLinearVelocity.mul(-1);

        if (negativeVelocity.Magnitude === 0) return Vector3.zero;

        return negativeVelocity.Unit.mul(magnitude * DRAG_MULTIPLIER);
    }

    private getDragCoefficient(reynoldsNumber: number) {
        if (reynoldsNumber < 1e5) {
            return 0.47;
        } else if (reynoldsNumber < 1.35e5) {
            return 0.47 - (0.25 * (reynoldsNumber - 1e5)) / 3.5e4;
        } else {
            return 0.22;
        }
    }

    private getReynoldsNumber() {
        // Coefficient is based on metric system, so convert from studs to meters

        const characteristicLength = DIAMETER / STUDS_PER_METER;
        const velocity = this.part.AssemblyLinearVelocity.Magnitude / STUDS_PER_METER;

        return ((AIR_DENSITY / STUDS_PER_METER ** 3) * velocity * characteristicLength) / VISCOSITY / STUDS_PER_METER;
    }
}

export default Ball;
