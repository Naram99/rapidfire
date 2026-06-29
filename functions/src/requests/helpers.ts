import * as functions from "firebase-functions";
import admin from "firebase-admin";

// Ensure admin is initialized when helpers are used
if (!admin.apps.length) admin.initializeApp();

const db = admin.database();

export function requireAuth(request: any): string {
    const uid = request.auth?.uid;
    if (!uid) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "User is not authenticated",
        );
    }
    return uid;
}

export function canonicalRequestKey(uidA: string, uidB: string): string {
    const [minUid, maxUid] = [uidA, uidB].sort();
    return `${minUid}_${maxUid}`;
}

export async function ensureNotFriends(uidA: string, uidB: string) {
    const snap = await db.ref(`friends/${uidA}/${uidB}`).get();
    if (snap.exists()) {
        throw new functions.https.HttpsError(
            "already-exists",
            "Users are already friends",
        );
    }
}

export async function getFriendRequest(requestKey: string) {
    const snap = await db.ref(`friendRequests/${requestKey}`).get();
    return snap.exists() ? snap.val() : null;
}

export async function ensurePendingRequestForRecipient(
    requestKey: string,
    recipientUid: string,
) {
    const req = await getFriendRequest(requestKey);
    if (!req) {
        throw new functions.https.HttpsError(
            "not-found",
            "Friend request not found",
        );
    }
    if (req.status !== "pending") {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "Friend request is not pending",
        );
    }
    if (req.to !== recipientUid) {
        throw new functions.https.HttpsError(
            "permission-denied",
            "Only the recipient can accept/deny the friend request",
        );
    }
    return req;
}

export async function ensureFriendshipExists(uidA: string, uidB: string) {
    const snap = await db.ref(`friends/${uidA}/${uidB}`).get();
    if (!snap.exists()) {
        throw new functions.https.HttpsError(
            "not-found",
            "Friendship does not exist",
        );
    }
}
