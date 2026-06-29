import { onCall } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import {
    requireAuth,
    canonicalRequestKey,
    ensureNotFriends,
    getFriendRequest,
} from "./requests/helpers";

if (!admin.apps.length) admin.initializeApp();

const db = admin.database();

export const sendFriendRequestCall = onCall(
    { region: "europe-west1" },
    async (request) => {
        logger.info("sendFriendRequest request received", {
            structuredData: true,
        });

        const fromUid = requireAuth(request);

        const toUid = request.data?.toUid;
        if (!toUid || typeof toUid !== "string") {
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Missing or invalid 'toUid'",
            );
        }

        if (toUid === fromUid) {
            throw new functions.https.HttpsError(
                "failed-precondition",
                "Cannot send friend request to yourself",
            );
        }

        const requestKey = canonicalRequestKey(fromUid, toUid);

        try {
            await ensureNotFriends(fromUid, toUid);

            // Check existing request
            const existing = await getFriendRequest(requestKey);
            if (existing && existing.status === "pending") {
                throw new functions.https.HttpsError(
                    "already-exists",
                    "A pending friend request already exists",
                );
            }

            const updates: Record<string, any> = {};
            updates[`friendRequests/${requestKey}`] = {
                from: fromUid,
                to: toUid,
                status: "pending",
                direction: `${fromUid}->${toUid}`,
                createdAt: admin.database.ServerValue.TIMESTAMP,
                updatedAt: admin.database.ServerValue.TIMESTAMP,
            };
            updates[`friendRequestsByUser/${toUid}/${requestKey}`] = true;
            updates[`friendRequestsSentByUser/${fromUid}/${requestKey}`] = true;

            await db.ref().update(updates);

            return { status: 201, requestKey };
        } catch (err: any) {
            logger.error("sendFriendRequest error", { error: err });
            if (err instanceof functions.https.HttpsError) throw err;
            throw new functions.https.HttpsError(
                "internal",
                "Failed to send friend request",
            );
        }
    },
);
