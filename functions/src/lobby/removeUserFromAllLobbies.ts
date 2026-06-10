import { Database } from "firebase-admin/database";
import * as logger from "firebase-functions/logger";
import removeUserFromLobby from "./removeUserFromLobby";

export default async function removeUserFromAllOtherLobbies(
    db: Database,
    userId: string,
    newLobbyId: string,
): Promise<void> {
    const userLobbyRef = db.ref(`user_lobby/${userId}`);

    const snapshot = await userLobbyRef.get();
    if (snapshot.exists()) {
        logger.warn(`User ${userId} is already in a lobby`, {
            structuredData: true,
        });

        const lobbies = Object.keys(snapshot.val());
        for (const lobbyId of lobbies) {
            await removeUserFromLobby(db, lobbyId, userId);
        }
    }

    const userCurrentLobbyRef = db.ref(`user_lobby/${userId}/${newLobbyId}`);
    await userCurrentLobbyRef.set(true);
}
