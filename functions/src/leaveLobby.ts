import { onCall } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";
import removeUserFromLobby from "./lobby/removeUserFromLobby";

admin.initializeApp();

const db = admin.database();

export const leaveLobbyCall = onCall(
    { region: "europe-west1" },
    async (request) => {
        logger.info("Leave lobby request received", { structuredData: true });

        const userId = request.auth?.uid;
        if (!userId) {
            return { status: 401, message: "User is not authenticated" };
        }

        const lobbyId = request.data.lobbyId;
        if (!lobbyId) {
            return { status: 400, message: "Lobby ID is required" };
        }

        const lobbyRef = db.ref(`lobby/${lobbyId}`);
        const snapshot = await lobbyRef.get();

        if (snapshot.exists()) {
            await removeUserFromLobby(db, lobbyId, userId);
        }

        return {
            status: 200,
            message: "Successfully left lobby",
        };
    },
);
