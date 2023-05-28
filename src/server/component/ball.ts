import { BaseComponent, Component } from "@flamework/components";
import { OnInit, OnPhysics } from "@flamework/core";

export const DIAMETER = 3;

const STUDS_PER_METER = 35 / 9.8;

const AIR_DENSITY = 1.225;
const SURFACE_AREA = math.pi * (DIAMETER / 2) ** 2;
const TEMPERATURE_IN_KELVIN = 294;

const VISCOSITY = 1.458e-6 * (TEMPERATURE_IN_KELVIN ** 1.5 / (TEMPERATURE_IN_KELVIN + 110.4));

type BallAttributes = {
    dragMultiplier: number;
    magnusMultiplier: number;
};

@Component({
    tag: "Ball",
})
export default class Ball extends BaseComponent<BallAttributes, BasePart> implements OnInit, OnPhysics {
    private dragForce = new Instance("VectorForce");
    private magnusForce = new Instance("VectorForce");

    public setCFrame(cframe: CFrame) {
        this.instance.CFrame = cframe;
        this.instance.AssemblyLinearVelocity = Vector3.zero;
        this.instance.AssemblyAngularVelocity = Vector3.zero;
    }

    public setParent(instance: Instance) {
        this.instance.Parent = instance;
    }

    onInit() {
        const attachment = new Instance("Attachment");
        attachment.Parent = this.instance;

        this.dragForce.Force = Vector3.zero;
        this.dragForce.RelativeTo = Enum.ActuatorRelativeTo.World;
        this.dragForce.Attachment0 = attachment;
        this.dragForce.Parent = this.instance;
        this.magnusForce.Force = Vector3.zero;
        this.magnusForce.RelativeTo = Enum.ActuatorRelativeTo.World;
        this.magnusForce.Attachment0 = attachment;
        this.magnusForce.Parent = this.instance;
    }

    onPhysics() {
        this.dragForce.Force = this.getDragForce();
        this.magnusForce.Force = this.getMagnusForce();
    }

    private getMagnusForce() {
        const velocity = this.instance.AssemblyLinearVelocity.Magnitude;
        const magnusCoefficient = this.getMagnusCoefficient();
        const magnitude = 0.5 * magnusCoefficient * AIR_DENSITY * velocity ** 2 * SURFACE_AREA;

        const linearVelocity = this.instance.AssemblyLinearVelocity;
        const angularVelocity = this.instance.AssemblyAngularVelocity;
        if (linearVelocity.Magnitude === 0 || angularVelocity.Magnitude === 0) return Vector3.zero;

        const direction = angularVelocity.Cross(linearVelocity);

        if (direction.Magnitude === 0) return Vector3.zero;

        return direction.Unit.mul(magnitude * this.attributes.dragMultiplier);
    }

    private getMagnusCoefficient() {
        // Coefficient is based on metric system, so convert from studs to meters

        const velocity = this.instance.AssemblyLinearVelocity.Magnitude / STUDS_PER_METER;
        if (velocity === 0) return 0;

        const angularVelocity = this.instance.AssemblyAngularVelocity.Magnitude / STUDS_PER_METER;

        return 0.385 * (((DIAMETER / 2 / STUDS_PER_METER) * angularVelocity) / velocity) ** 0.25;
    }

    private getDragForce() {
        const reynoldsNumber = this.getReynoldsNumber();
        const dragCoefficient = this.getDragCoefficient(reynoldsNumber);
        const velocity = this.instance.AssemblyLinearVelocity.Magnitude;
        const magnitude = 0.5 * AIR_DENSITY * velocity ** 2 * SURFACE_AREA * dragCoefficient;
        const negativeVelocity = this.instance.AssemblyLinearVelocity.mul(-1);

        if (negativeVelocity.Magnitude === 0) return Vector3.zero;

        return negativeVelocity.Unit.mul(magnitude * this.attributes.magnusMultiplier);
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
        const velocity = this.instance.AssemblyLinearVelocity.Magnitude / STUDS_PER_METER;

        return ((AIR_DENSITY / STUDS_PER_METER ** 3) * velocity * characteristicLength) / VISCOSITY / STUDS_PER_METER;
    }
}
