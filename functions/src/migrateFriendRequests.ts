import { onCall } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as functions from "firebase-functions";
import admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();

const db = admin.database();

export const migrateFriendRequestsCall = onCall(
    { region: "europe-west1" },
    async (request) => {
        logger.info("migrateFriendRequests request received", {
            structuredData: true,
        });

        const userId = request.auth?.uid;
        if (!userId) {
            throw new functions.https.HttpsError(
                "unauthenticated",
                "User is not authenticated",
            );
        }

        try {
            const rootSnap = await db.ref("friendRequests").get();
            if (!rootSnap.exists()) {
                return {
                    status: 200,
                    message: "No friend requests to migrate",
                    migrated: 0,
                };
            }

            const updates: Record<string, any> = {};
            let migratedCount = 0;

            rootSnap.forEach((child) => {
                const key = child.key as string;
                const val = child.val();
                const from: string | undefined = val?.from;
                const to: string | undefined = val?.to;

                if (!from || !to) {
                    // malformed entry -> delete it
                    updates[`friendRequests/${key}`] = null;
                    migratedCount++;
                    return;
                }

                const [minUid, maxUid] = [from, to].sort();
                const canonicalKey = `${minUid}_${maxUid}`;

                // If key already canonical and indexes present, ensure indexes exist
                if (key === canonicalKey) {
                    updates[`friendRequestsByUser/${to}/${canonicalKey}`] =
                        true;
                    updates[
                        `friendRequestsSentByUser/${from}/${canonicalKey}`
                    ] = true;
                    return;
                }

                // Move to canonical key and remove old
                updates[`friendRequests/${canonicalKey}`] = {
                    ...val,
                };
                updates[`friendRequests/${key}`] = null;

                // Indexes
                updates[`friendRequestsByUser/${to}/${canonicalKey}`] = true;
                updates[`friendRequestsSentByUser/${from}/${canonicalKey}`] =
                    true;

                migratedCount++;
            });

            if (Object.keys(updates).length > 0) {
                await db.ref().update(updates);
            }

            return {
                status: 200,
                message: "Migration complete",
                migrated: migratedCount,
            };
        } catch (err: any) {
            logger.error("migrateFriendRequests error", { error: err });
            throw new functions.https.HttpsError(
                "internal",
                "Failed to run migration",
            );
        }
    },
);
