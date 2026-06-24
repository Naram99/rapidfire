import * as logger from "firebase-functions/logger";
import admin from "firebase-admin";
import { onCall } from "firebase-functions/https";
import { randomTopicWithDifficulty } from "./game/randomTopicWithDifficulty";

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

        const rounds: {
            [index: number]: {
                [topic: string]: {
                    difficulty: string;
                    questions: {
                        question: string;
                        options: string[];
                        correct: string;
                    }[];
                };
            };
        } = {};

        for (let i = 0; i < roundCount; i++) {
            rounds[i] = await randomTopicWithDifficulty(db);
        }
        // TODO: game creation from topics

        return { status: 201, rounds: rounds };
    },
);
