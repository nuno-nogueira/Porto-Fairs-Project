import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
    throw new Error("SECRET is not defined.");
}

export const createToken = (userId: string) => {
    
    return jwt.sign({id: userId}, SECRET, {expiresIn: "24h"});
}


export interface JwtPayload {
    id: string
}

export const verifyToken = (token: string): JwtPayload => {

    const tokenDecoded = jwt.verify(token, SECRET);

    if (typeof tokenDecoded !== "object") {
        throw new Error("Ivalid token.");
    }

    return tokenDecoded as JwtPayload

}