import { onCall } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";

admin.initializeApp();

const db = admin.database();

export const createLobbyCall = onCall(
    { region: "europe-west1" },
    async (request) => {
        logger.info("Create lobby request received", { structuredData: true });

        const userId = request.auth?.uid;
        if (!userId) {
            return { status: 401, message: "User is not authenticated" };
        }

        const lobbyId = generateLobbyId(); // TODO: Implement a proper lobby ID generation logic

        // TODO: Change fixed lobby id to a generated one
        const lobbyRef = db.ref(`lobby/${lobbyId}`);
        await lobbyRef.set({
            host: userId,
            createdAt: admin.database.ServerValue.TIMESTAMP,
        });

        const membersRef = db.ref(`lobby_members/${lobbyId}/${userId}`);
        await membersRef.set(true);

        logger.info(`Lobby created with ID: ${lobbyId}`);
        return { status: 201, lobbyId };
    },
);

function generateLobbyId(): string {
    // TODO: Implement a proper lobby ID generation logic
    return "dr0v3";
}
