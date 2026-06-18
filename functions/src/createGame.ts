import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";
import { onCall } from "firebase-functions/https";

admin.initializeApp();

const db = admin.database();

export const createGameCall = onCall(
    { region: "europe-west1" },
    async (request) => {
        logger.info("Create game request received", { structuredData: true });

        const userId = request.auth?.uid;
        if (!userId) {
            return { status: 401, message: "User is not authenticated" };
        }

        // TODO: game creation from topics
    },
);
