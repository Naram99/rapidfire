import {
    get,
    ref,
    set,
    update,
    query,
    orderByChild,
    startAt,
    endAt,
} from "firebase/database";
import {
    getDownloadURL,
    ref as storageRef,
    uploadBytes,
} from "firebase/storage";
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updateEmail as firebaseUpdateEmail,
    updatePassword as firebaseUpdatePassword,
    updateProfile as firebaseUpdateProfile,
    type User,
} from "firebase/auth";
import {
    fireBaseStorage,
    fireBaseRealTimeDB,
    fireBaseFunctions,
} from "../firebase";
import { httpsCallable } from "firebase/functions";
import type { PublicProfile, UserProfile } from "../types/userProfile";

const storage = fireBaseStorage;

const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const MAX_PROFILE_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB

export function getUserDataRef(uid: string) {
    return ref(fireBaseRealTimeDB, `user_data/${uid}`);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const snapshot = await get(getUserDataRef(uid));
    return snapshot.exists() ? (snapshot.val() as UserProfile) : null;
}

export async function writeUserProfile(
    uid: string,
    data: Partial<UserProfile>,
): Promise<void> {
    const userRef = getUserDataRef(uid);
    await update(userRef, data);
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
    const existing = await getUserProfile(user.uid);

    const profile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        emailLowercase: (user.email || "").toLowerCase(),
        displayName: user.displayName || "",
        displayNameLowercase: (user.displayName || "").toLowerCase(),
        photoURL: user.photoURL || "",
        stats: existing?.stats || {},
        friends: existing?.friends || {},
        incomingFriendRequests: existing?.incomingFriendRequests || {},
        outgoingFriendRequests: existing?.outgoingFriendRequests || {},
    };

    if (!existing) {
        await set(getUserDataRef(user.uid), profile);
    } else {
        await update(getUserDataRef(user.uid), {
            email: profile.email,
            emailLowercase: profile.emailLowercase,
            displayName: profile.displayName,
            displayNameLowercase: profile.displayNameLowercase,
            photoURL: profile.photoURL,
        });
    }

    return profile;
}

function validateImage(file: File): string | null {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
        return `Unsupported image type. Allowed: ${ALLOWED_IMAGE_EXTENSIONS.join(", ")}`;
    }

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
        return `Image file must be smaller than ${MAX_PROFILE_IMAGE_BYTES / 1024 / 1024} MB.`;
    }

    return null;
}

export async function uploadProfilePicture(
    uid: string,
    file: File,
): Promise<string> {
    const validationError = validateImage(file);
    if (validationError) {
        throw new Error(validationError);
    }

    const fileRef = storageRef(
        storage,
        `profile_images/${uid}/${Date.now()}_${file.name}`,
    );
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
}

export async function searchUsers(queryText: string): Promise<PublicProfile[]> {
    const normalized = queryText.trim().toLowerCase();
    if (!normalized) {
        return [];
    }

    const rootRef = ref(fireBaseRealTimeDB, "user_data");
    const displayNameQuery = query(
        rootRef,
        orderByChild("displayNameLowercase"),
        startAt(normalized),
        endAt(`${normalized}\uf8ff`),
    );
    const emailQuery = query(
        rootRef,
        orderByChild("emailLowercase"),
        startAt(normalized),
        endAt(`${normalized}\uf8ff`),
    );

    const [displayNameSnapshot, emailSnapshot] = await Promise.all([
        get(displayNameQuery),
        get(emailQuery),
    ]);
    const results: Record<string, PublicProfile> = {};

    if (displayNameSnapshot.exists()) {
        Object.entries(
            displayNameSnapshot.val() as Record<string, UserProfile>,
        ).forEach(([uid, profile]) => {
            results[uid] = {
                uid,
                displayName: profile.displayName,
                photoURL: profile.photoURL,
            };
        });
    }

    if (emailSnapshot.exists()) {
        Object.entries(
            emailSnapshot.val() as Record<string, UserProfile>,
        ).forEach(([uid, profile]) => {
            results[uid] = {
                uid,
                email: profile.email,
                displayName: profile.displayName,
                photoURL: profile.photoURL,
            };
        });
    }

    return Object.values(results);
}

export async function getIncomingFriendRequests(
    uid: string,
): Promise<Array<{ requestKey: string; from: string; to: string; createdAt?: number }>> {
    const byUserRef = ref(fireBaseRealTimeDB, `friendRequestsByUser/${uid}`);
    const byUserSnap = await get(byUserRef);
    if (!byUserSnap.exists()) {
        return [];
    }

    const keys = Object.keys(byUserSnap.val() as Record<string, true>);
    const requestsRaw = await Promise.all(
        keys.map(async (key) => {
            const reqSnap = await get(ref(fireBaseRealTimeDB, `friendRequests/${key}`));
            if (!reqSnap.exists()) return null;
            const val = reqSnap.val();
            if (val.status !== "pending") return null;
            return {
                requestKey: key,
                from: val.from,
                to: val.to,
                createdAt: val.createdAt,
            };
        }),
    );

    const requests = requestsRaw as Array<
        | { requestKey: string; from: unknown; to: unknown; createdAt?: unknown }
        | null
    >;

    return requests.filter(
        (r): r is { requestKey: string; from: string; to: string; createdAt?: number } =>
            r !== null && typeof r.from === "string" && typeof r.to === "string",
    );
}

export async function sendFriendRequest(
    currentUid: string,
    targetUid: string,
): Promise<void> {
    if (currentUid === targetUid) {
        throw new Error("Cannot send a friend request to yourself.");
    }

    try {
        const fn = httpsCallable(fireBaseFunctions, "sendFriendRequest");
        await fn({ toUid: targetUid });
        return;
    } catch (err: unknown) {
        // Normalize error
        const message = err instanceof Error ? err.message : "Unable to send friend request.";
        throw new Error(message, { cause: err as Error | undefined });
    }
}

export async function acceptFriendRequest(
    currentUid: string,
    requesterUid: string,
): Promise<void> {
    // compute canonical request key
    const [minUid, maxUid] = [currentUid, requesterUid].sort();
    const requestKey = `${minUid}_${maxUid}`;

    try {
        const fn = httpsCallable(fireBaseFunctions, "acceptFriendRequest");
        await fn({ requestKey });
        return;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to accept friend request.";
        throw new Error(message, { cause: err as Error | undefined });
    }
}

export async function denyFriendRequest(
    currentUid: string,
    requesterUid: string,
): Promise<void> {
    const [minUid, maxUid] = [currentUid, requesterUid].sort();
    const requestKey = `${minUid}_${maxUid}`;

    try {
        const fn = httpsCallable(fireBaseFunctions, "denyFriendRequest");
        await fn({ requestKey });
        return;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to deny friend request.";
        throw new Error(message, { cause: err as Error | undefined });
    }
}

export async function removeFriend(friendUid: string): Promise<void> {
    try {
        const fn = httpsCallable(fireBaseFunctions, "removeFriend");
        await fn({ friendId: friendUid });
        return;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to remove friend.";
        throw new Error(message, { cause: err as Error | undefined });
    }
}

export async function reauthenticateUser(
    user: User,
    currentPassword: string,
): Promise<void> {
    const credential = EmailAuthProvider.credential(
        user.email || "",
        currentPassword,
    );
    await reauthenticateWithCredential(user, credential);
}

export async function updateAuthDisplayName(
    user: User,
    displayName: string,
): Promise<void> {
    await firebaseUpdateProfile(user, { displayName });
}

export async function updateAuthPhotoURL(
    user: User,
    photoURL: string,
): Promise<void> {
    await firebaseUpdateProfile(user, { photoURL });
}

export async function updateAuthEmail(
    user: User,
    email: string,
): Promise<void> {
    await firebaseUpdateEmail(user, email);
}

export async function updateAuthPassword(
    user: User,
    password: string,
): Promise<void> {
    await firebaseUpdatePassword(user, password);
}
