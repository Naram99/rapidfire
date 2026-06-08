import { onCall } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

export const createRoomCall = onCall(
    { region: "europe-west1" },
    async (request) => {
        logger.info("Create room request received", { structuredData: true });

        const userId = request.auth?.uid;
        if (!userId) {
            return { status: 401, message: "User is not authenticated" };
        }

        const roomId = generateRoomId(); // TODO: Implement a proper room ID generation logic

        // TODO: Change fixed room id to a generated one
        const roomRef = db.collection("rooms").doc(roomId);
        await roomRef.set({
            host: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const membersRef = db.collection("rooms_members").doc(roomId);
        await membersRef.set({ userId: true });

        logger.info(`Room created with ID: ${roomId}`);
        return { status: 201, roomId };
    },
);

function generateRoomId(): string {
    // TODO: Implement a proper room ID generation logic
    return "dr0v3";
}
