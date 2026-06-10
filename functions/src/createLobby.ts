import { onCall } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";
import removeUserFromAllOtherLobbies from "./lobby/removeUserFromAllLobbies";

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

        await removeUserFromAllOtherLobbies(db, userId, lobbyId);

        const lobbyRef = db.ref(`lobby/${lobbyId}`);
        await lobbyRef.set({
            host: userId,
            createdAt: admin.database.ServerValue.TIMESTAMP,
        });

        const membersRef = db.ref(`lobby_members/${lobbyId}/${userId}`);
        await membersRef.set({ ready: false });

        logger.info(`Lobby created with ID: ${lobbyId}`);
        return {
            status: 201,
            lobbyId,
            host: userId,
            message: "Successfully created lobby",
        };
    },
);

function generateLobbyId(): string {
    // TODO: Implement a proper lobby ID generation logic
    return "dr0v3";
}
