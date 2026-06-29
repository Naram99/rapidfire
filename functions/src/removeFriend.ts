import { onCall } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import { requireAuth, ensureFriendshipExists } from "./requests/helpers";

if (!admin.apps.length) admin.initializeApp();

const db = admin.database();

export const removeFriendCall = onCall(
    { region: "europe-west1" },
    async (request) => {
        logger.info("removeFriend request received", { structuredData: true });

        const userId = requireAuth(request);

        const friendId = request.data?.friendId;
        if (!friendId || typeof friendId !== "string") {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Missing or invalid 'friendId'",
            );
        }

        if (friendId === userId) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Cannot remove yourself",
            );
        }

        try {
            await ensureFriendshipExists(userId, friendId);

            const updates: Record<string, any> = {};
            updates[`friends/${userId}/${friendId}`] = null;
            updates[`friends/${friendId}/${userId}`] = null;

            await db.ref().update(updates);

            return { status: 200, message: "Friend removed" };
        } catch (err: any) {
            logger.error("removeFriend error", { error: err });
            if (err instanceof functions.https.HttpsError) throw err;
            throw new functions.https.HttpsError(
                "internal",
                "Failed to remove friend",
            );
        }
    },
);
