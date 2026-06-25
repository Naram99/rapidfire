import { httpsCallable } from "firebase/functions";
import { create } from "zustand";
import { fireBaseFunctions } from "../firebase";

type Game = {
    id: string;
    start: object;
    rounds: {
        [index: number]: Round;
    };
    isActive: boolean;
    isFinished: boolean;
    lobby?: string;
};

type Round = {
    [topic: string]: {
        difficulty: string;
        questions: Question[];
    };
};

type Question = {
    question: string;
    options: string[];
};

type CreateGameResponse = {
    status: number;
    game: Game;
};

interface gameStore {
    isLoading: boolean;
    game: Game | null;
    error: string | null;

    createGame: () => Promise<void>;
}

const functions = fireBaseFunctions;
const createGameCall = httpsCallable(functions, "createGame");

const GameStore = create<gameStore>((set) => ({
    isLoading: false,
    game: null,
    error: null,

    createGame: async () => {
        set({ isLoading: true });

        const result = await createGameCall();

        console.log(result);

        if (!result.data) {
            set({ isLoading: false, error: "Invalid response" });
            throw new Error("Invalid response");
        }

        const response = result.data as CreateGameResponse;
        if (response.status !== 201 || !response.game) {
            set({ isLoading: false, error: "Invalid response" });
            throw new Error("Invalid response");
        }

        console.log(response.game);

        set({
            isLoading: false,
            game: response.game,
            error: null,
        });
    },
}));

export default GameStore;
