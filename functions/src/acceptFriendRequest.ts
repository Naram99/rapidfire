import { onCall } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import {
    requireAuth,
    ensurePendingRequestForRecipient,
} from "./requests/helpers";

if (!admin.apps.length) admin.initializeApp();

const db = admin.database();

export const acceptFriendRequestCall = onCall(
    { region: "europe-west1" },
    async (request) => {
        logger.info("acceptFriendRequest request received", {
            structuredData: true,
        });

        const userId = requireAuth(request);

        const requestKey = request.data?.requestKey;
        if (!requestKey || typeof requestKey !== "string") {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Missing or invalid 'requestKey'",
            );
        }

        try {
            const req = await ensurePendingRequestForRecipient(
                requestKey,
                userId,
            );

            const fromUid = req.from;
            const toUid = req.to;
            if (!fromUid || !toUid) {
                throw new functions.https.HttpsError(
                    "internal",
                    "Malformed friend request data",
                );
            }

            const updates: Record<string, any> = {};
            // Create friendship both ways
            updates[`friends/${fromUid}/${toUid}`] = {
                since: admin.database.ServerValue.TIMESTAMP,
            };
            updates[`friends/${toUid}/${fromUid}`] = {
                since: admin.database.ServerValue.TIMESTAMP,
            };

            // Remove request entries
            updates[`friendRequests/${requestKey}`] = null;
            updates[`friendRequestsByUser/${toUid}/${requestKey}`] = null;
            updates[`friendRequestsSentByUser/${fromUid}/${requestKey}`] = null;

            await db.ref().update(updates);

            return {
                status: 200,
                message: "Friend request accepted",
                friendId: fromUid,
            };
        } catch (err: any) {
            logger.error("acceptFriendRequest error", { error: err });
            if (err instanceof functions.https.HttpsError) throw err;
            throw new functions.https.HttpsError(
                "internal",
                "Failed to accept friend request",
            );
        }
    },
);
