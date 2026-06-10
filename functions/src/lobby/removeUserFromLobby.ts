import { Database } from "firebase-admin/database";
import reassignHostIfNeeded from "./reassignHostIfNeeded";

export default async function removeUserFromLobby(
    db: Database,
    lobbyId: string,
    userId: string,
) {
    const lobbyMembersRef = db.ref(`lobby_members/${lobbyId}/${userId}`);
    await lobbyMembersRef.remove();

    await reassignHostIfNeeded(db, lobbyId, userId);
}
