import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";
import { onCall } from "firebase-functions/https";
import { randomTopicWithDifficulty } from "./game/randomTopicWithDifficulty";
import type { Round } from "./game/randomTopicWithDifficulty";

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

admin.initializeApp();

const db = admin.database();

export const createGameCall = onCall(
    { region: "europe-west1" },
    async (request) => {
        logger.info("Create game request received", { structuredData: true });

        const userId = request.auth?.uid;
        if (!userId) {
            return { status: 401, message: "User is not authenticated" };
        }

        const roundCount = request.data?.rounds ?? 1;

        const game: Game = {
            id: crypto.randomUUID(),
            start: admin.database.ServerValue.TIMESTAMP,
            rounds: {},
            isActive: true,
            isFinished: false,
        };

        for (let i = 0; i < roundCount; i++) {
            game.rounds[i] = await randomTopicWithDifficulty(db);
        }
        // TODO: game creation from topics

        return { status: 201, game: game };
    },
);
