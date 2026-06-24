import { onCall } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";
import removeUserFromAllOtherLobbies from "./lobby/removeUserFromAllLobbies";

admin.initializeApp();

const db = admin.database();

export const joinLobbyCall = onCall(
    { region: "europe-west1" },
    async (request) => {
        logger.info("Join lobby request received", { structuredData: true });

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

        if (!snapshot.exists()) {
            return { status: 404, message: "Lobby not found" };
        }

        await removeUserFromAllOtherLobbies(db, userId, lobbyId);

        const membersRef = db.ref(`lobby_members/${lobbyId}/${userId}`);
        await membersRef.set({ ready: false });

        logger.info(`User joined lobby: ${lobbyId}`);
        return {
            status: 200,
            message: "Successfully joined lobby",
            lobbyId,
            host: snapshot.val().host,
        };
    },
);
