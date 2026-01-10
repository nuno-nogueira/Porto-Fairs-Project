import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, {Role} from "../models/User";
import {createToken} from "../utils/jws"

export const registerUser = async (req: Request, res: Response) => {

    try {

        const {name, email, password} = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({message: "All fields are required."});
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({message: "Email is already in use. Please try again with a different email."})
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        const newUser = await User.create({
            name, 
            email, 
            passwordHash
        })

        return res.status(201).json({message: "User creates successfully.", newUser});

    } catch (error) {
        console.error("RegisterUser:", error);
        return res.status(500).json({message: "Internal error.", error});
    }
}

export const loginUser = async (req: Request, res: Response) => {

    try {
        
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if (!user) {
            return res.status(400).json({message: "User is not found. Please try again."});
        }

        const passwordVerified = await bcrypt.compare(password, user.passwordHash);
        if (!passwordVerified) {
            return res.status(400).json({message: "Password is wrong. Please try again."});
        }

        const token = createToken(user._id.toString());

        return res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        return res.status(500).json({message: "Internal error.", error})
    }
}

export const getUser = async (req: Request, res: Response) => {

    try {
        
        const user = await User.findById(req.user._id).select("-passwordHash");
        return res.json(user);
    
    } catch (error) {
    
        return res.status(500).json({message:"Internal error."})
    
    }

}

export const getAllUsers = async (req: Request, res: Response) => {

    try {
        
        const users = await User.find().select("-passwordHash");

        return res.json(users);

    } catch (error) {
        return res.status(500).json({message: "Internal error.", error})
    }
}