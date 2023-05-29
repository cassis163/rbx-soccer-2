import { Networking } from "@flamework/networking";

// Client -> Server -> Client functions
interface ServerFunctions {
    kick(ballPart: BasePart, impulse: Vector3, position: Vector3): boolean;
}

// Server -> Client -> Server functions
interface ClientFunctions {}

export const GlobalFunctions = Networking.createFunction<ServerFunctions, ClientFunctions>();
