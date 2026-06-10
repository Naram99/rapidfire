import { httpsCallable } from "firebase/functions";
import { create } from "zustand";
import { fireBaseFunctions } from "../firebase";

type LobbyMember = {
    id: string;
    ready: boolean;
    name?: string;
};

type LobbyResponse = {
    status: number;
    lobbyId?: string;
    message?: string;
    host?: string;
};

interface lobbyStore {
    lobbyId: string | null;
    host: string | null;
    members: LobbyMember[];

    createLobby: () => Promise<string>;

    joinLobby: (lobbyId: string) => Promise<string>;

    leaveLobby: (lobbyId: string) => Promise<void>;
}

const functions = fireBaseFunctions;

const LobbyStore = create<lobbyStore>((set) => ({
    lobbyId: null,
    host: null,
    members: [],

    createLobby: async () => {
        const createLobbyCall = httpsCallable(functions, "createLobby");

        const result = await createLobbyCall();
        if (!result.data) {
            throw new Error("Not valid response");
        }

        const response = result.data as LobbyResponse;
        if (response.status !== 201 || !response.lobbyId) {
            throw new Error("Not valid response");
        }

        set({
            lobbyId: response.lobbyId,
            host: response.host,
            members: [],
        });

        return response.lobbyId;
    },

    joinLobby: async (lobbyId: string) => {
        const joinLobbyCall = httpsCallable(functions, "joinLobby");

        const result = await joinLobbyCall({ lobbyId });
        if (!result.data) {
            throw new Error("Not valid response");
        }

        const response = result.data as LobbyResponse;
        if (response.status !== 200 || !response.lobbyId) {
            throw new Error("Not valid response");
        }

        set({
            lobbyId: response.lobbyId,
            members: [],
        });

        return response.lobbyId;
    },

    leaveLobby: async (lobbyId: string) => {
        const leaveLobbyCall = httpsCallable(functions, "leaveLobby");

        await leaveLobbyCall({ lobbyId });

        set({ lobbyId: null, host: null, members: [] });
    },
}));

export default LobbyStore;
