import { onCall } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";

admin.initializeApp();

const db = admin.database();

export const joinRoomCall = onCall(
    { region: "europe-west1" },
    async (request) => {
        logger.info("Join room request received", { structuredData: true });

        const userId = request.auth?.uid;
        if (!userId) {
            return { status: 401, message: "User is not authenticated" };
        }

        const roomId = request.data.roomId;
        if (!roomId) {
            return { status: 400, message: "Room ID is required" };
        }

        const roomRef = db.ref(`rooms/${roomId}`);
        const snapshot = await roomRef.get();

        if (!snapshot.exists) {
            return { status: 404, message: "Room not found" };
        }

        const membersRef = db.ref(`rooms_members/${roomId}/${userId}`);
        await membersRef.set(true);

        logger.info(`User joined room: ${roomId}`);
        return { status: 200, message: "Successfully joined room" };
    },
);
