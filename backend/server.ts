//npm install -D ts-node typescript @types/node

//TO RUN THE SERVER: npx ts-node server.ts

import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";
import {connectToMongoDB} from "./src/config/db";

const port = Number(process.env.PORT) || 3000;

const server = async () => {

    try {
        console.log("lalala");
        console.log(process.env.MONGO_URI);

        await connectToMongoDB();
        
        console.log("lululu");

        

        app.listen(port, () => {
            console.log(`App listening at http://localhost:${port}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}



server();
