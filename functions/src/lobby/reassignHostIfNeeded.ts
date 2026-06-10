import { Database } from "firebase-admin/database";

export default async function reassignHostIfNeeded(
    db: Database,
    lobbyId: string,
    leavingUserId: string,
): Promise<void> {
    const lobbyRef = db.ref(`lobby/${lobbyId}`);
    const lobbySnapshot = await lobbyRef.get();

    if (!lobbySnapshot.exists()) {
        return;
    }

    const hostId = lobbySnapshot.val().host;
    if (hostId !== leavingUserId) {
        return;
    }

    const lobbyMembersRef = db.ref(`lobby_members/${lobbyId}`);
    const snapshot = await lobbyMembersRef.get();

    if (!snapshot.exists()) {
        await lobbyRef.remove();
        return;
    }

    const members = snapshot.val();
    const memberIds = Object.keys(members).filter((id) => id !== leavingUserId);

    if (memberIds.length > 0) {
        const newHostId = memberIds[0];
        await lobbyRef.update({ host: newHostId });
        return;
    } else {
        await lobbyRef.remove();
        return;
    }
}
