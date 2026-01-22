import mongoose from 'mongoose';
import 'dotenv/config'; 
import MarketModel from './markets.model.js';


const db = {};
db.mongoose = mongoose;

(async () => {
    try {
        const config = {
            USER: process.env.DB_USER,
            PASSWORD: process.env.DB_PASSWORD,
            DB: process.env.DB_NAME,
            HOST: process.env.HOST
        };
        
        const mongoDBURL = process.env.MONGO_URL || `mongodb+srv://sic_db_user:${config.PASSWORD}@cluster0.mzx76ay.mongodb.net/${config.DB}?retryWrites=true&w=majority`;

        await db.mongoose.connect(mongoDBURL);
        console.log("Connected to the database!");
    } catch (error) {
        console.log("❌ Unable to connect to the database:", error);
        process.exit(1);
    }
})();

db.Market = MarketModel(mongoose);
export default db;

