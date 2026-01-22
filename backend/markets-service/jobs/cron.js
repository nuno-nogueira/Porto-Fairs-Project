import cron from 'node-cron';
import Market from '../models/markets.model.js'; // Importante: em ESM precisas da extensão .js
import axios from 'axios';
import logger from '../utils/logger.js';
import db from '../models/db.js';

cron.schedule('*/1 * * * *', async() => {
    try {
        const markets = await db.Market.find();
        console.log("Markets encontrados:", markets.length);
        const now = new Date();

        const scheduleNotification = new Date(now.getTime() + 60000);
        const notificationHour = scheduleNotification.getHours().toString().padStart(2, '0');
        const notificationMinute = scheduleNotification.getMinutes().toString().padStart(2, '0');
        const notificationString = `${notificationHour}:${notificationMinute}`

        logger.info(`[Cron] Looking for markets that open at ${notificationString}`);

        const marketsToNotify = markets.filter(market => {
            if (!market.openingHours) return false;

            // Match the starting hour
            const match = market.openingHours?.match(/(\d{2}:\d{2})/);
            return match && match[1] === notificationString;
        });

        if (marketsToNotify.length > 0) {
            marketsToNotify.forEach(market => {
                logger.info(`The market ${market.name} will open in x minutes!`);
        });
        }
    } catch (error) {
        logger.error(`Cron error: ${error.message}`)
    }
})

// cron.schedule("* * * * *", async () => {

//     try {
        
//         logger.info("Cron job Notification: Trying to send a new promotion everyday at 9h.");

//         const res= await axios.get(`${USERS_SERVICE_URL}/users?role=buyer`);
//         const users= res.data;

//         console.log("users:", users.length);

//         const notifications = users.map(user => ({
//             user_id: user._id,
//             type: "promotion",
//             content: "Special offer: 20% discount on all types of potatoes! Even the lazy ones..."
//         }))

//         await Notification.insertMany(notifications);
//         logger.info("Cron job Notification: Notification sent.");

//     } catch (error) {
//         logger.error("Cron job Notification: Notification was NOT sent.")
//     }

// })