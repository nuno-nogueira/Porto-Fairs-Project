import {Schema, model} from "mongoose";

export type Role = "consumer" | "seller";

export interface InterfaceUser {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
} 

const userSchema = new Schema<InterfaceUser> ({

    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    passwordHash: {type: String, required: true},
    role: {type: String, enum: ["consumer", "seller"], default:"consumer"}
})

export default model<InterfaceUser>("User", userSchema);