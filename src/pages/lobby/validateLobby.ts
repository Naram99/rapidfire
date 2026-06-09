import { get, ref } from "firebase/database";
import { fireBaseRealTimeDB } from "../../firebase";

export async function checkLobbyExists(lobbyId: string): Promise<boolean> {
    const db = fireBaseRealTimeDB;
    const lobbyRef = ref(db, `lobby/${lobbyId}`);
    const snapshot = await get(lobbyRef);

    return snapshot.exists();
}

export async function checkUserInLobby(
    lobbyId: string,
    userId: string,
): Promise<boolean> {
    const db = fireBaseRealTimeDB;
    const userLobbyRef = ref(db, `lobby_members/${lobbyId}/${userId}`);
    const snapshot = await get(userLobbyRef);

    return snapshot.exists();
}
