import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router";
import AuthStore from "../../zustand/authStore";
import {
    acceptFriendRequestByKey,
    denyFriendRequestByKey,
    ensureUserProfile,
    getFriends,
    getUserProfile,
    getIncomingFriendRequests,
    removeFriend,
    reauthenticateUser,
    searchUsers,
    sendFriendRequest,
    uploadProfilePicture,
    updateAuthDisplayName,
    updateAuthEmail,
    updateAuthPassword,
    updateAuthPhotoURL,
    writeUserProfile,
} from "../../firebase/profile";
import { fireBaseAuth } from "../../firebase";
import type { PublicProfile, UserProfile } from "../../types/userProfile";
import styles from "./profile.module.css";

const MAX_SEARCH_RESULTS = 8;

export default function Profile() {
    const user = AuthStore((state) => state.user);
    const setUser = AuthStore((state) => state.setUser);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [displayNameInput, setDisplayNameInput] = useState("");
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);

    const photoPreview = useMemo(() => {
        if (selectedPhoto) {
            return URL.createObjectURL(selectedPhoto);
        }

        return profile?.photoURL || "";
    }, [selectedPhoto, profile?.photoURL]);

    useEffect(() => {
        if (!selectedPhoto) {
            return;
        }

        return () => {
            URL.revokeObjectURL(photoPreview);
        };
    }, [photoPreview, selectedPhoto]);

    const [newEmail, setNewEmail] = useState("");
    const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<PublicProfile[]>([]);
    const [requesting, setRequesting] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<PublicProfile | null>(
        null,
    );

    const [incomingRequests, setIncomingRequests] = useState<
        Array<{
            requestKey: string;
            from: string;
            to: string;
            createdAt?: number;
            requester: PublicProfile;
        }>
    >([]);
    const [friends, setFriends] = useState<PublicProfile[]>([]);

    useEffect(() => {
        if (!user) {
            return;
        }

        async function loadProfile() {
            setIsLoading(true);
            setErrorMessage(null);
            setSuccessMessage(null);

            try {
                const dbProfile = await ensureUserProfile(
                    user as NonNullable<typeof user>,
                );
                setProfile(dbProfile);
                setDisplayNameInput(dbProfile.displayName || "");
                setNewEmail(dbProfile.email || "");
                try {
                    const [friendsList, incoming] = await Promise.all([
                        getFriends(dbProfile.uid),
                        getIncomingFriendRequests(dbProfile.uid),
                    ]);
                    setFriends(friendsList);
                    setIncomingRequests(incoming);
                } catch (e) {
                    console.error(
                        "Failed to load friends or incoming friend requests",
                        e,
                    );
                    setFriends([]);
                    setIncomingRequests([]);
                }
            } catch (error) {
                setErrorMessage("Unable to load profile. Please refresh.");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }

        loadProfile();
    }, [user]);

    useEffect(() => {
        if (!selectedPhoto) {
            return;
        }

        return () => {
            URL.revokeObjectURL(photoPreview);
        };
    }, [photoPreview, selectedPhoto]);

    const publicProfile = useMemo(() => {
        if (!profile) {
            return null;
        }

        return {
            displayName: profile.displayName || "Unknown",
            email: profile.email || "",
            photoURL: profile.photoURL || "",
        };
    }, [profile]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    async function refreshProfile() {
        if (!user) {
            return;
        }

        const dbProfile = await getUserProfile(user.uid);
        if (dbProfile) {
            setProfile(dbProfile);
            setDisplayNameInput(dbProfile.displayName || "");
            setNewEmail(dbProfile.email || "");
            try {
                const [friendsList, incoming] = await Promise.all([
                    getFriends(dbProfile.uid),
                    getIncomingFriendRequests(dbProfile.uid),
                ]);
                setFriends(friendsList);
                setIncomingRequests(incoming);
            } catch (e) {
                console.error(
                    "Failed to load friends or incoming friend requests",
                    e,
                );
                setFriends([]);
                setIncomingRequests([]);
            }
        }
    }

    async function handleDisplayNameUpdate(
        e: React.FormEvent<HTMLFormElement>,
    ) {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!displayNameInput.trim()) {
            setErrorMessage("Display name cannot be empty.");
            return;
        }

        const currentUser = user as NonNullable<typeof user>;

        try {
            await updateAuthDisplayName(currentUser, displayNameInput.trim());
            await writeUserProfile(currentUser.uid, {
                displayName: displayNameInput.trim(),
                displayNameLowercase: displayNameInput.trim().toLowerCase(),
            });
            setSuccessMessage("Display name updated.");
            setUser(fireBaseAuth.currentUser);
            await refreshProfile();
        } catch (error) {
            console.error(error);
            setErrorMessage("Unable to update display name.");
        }
    }

    function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
        setPhotoError(null);
        setSuccessMessage(null);
        const file = e.target.files?.[0] ?? null;
        if (!file) {
            setSelectedPhoto(null);
            return;
        }

        setSelectedPhoto(file);
    }

    async function handlePhotoUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!selectedPhoto) {
            setPhotoError("Choose an image before uploading.");
            return;
        }

        const currentUser = user as NonNullable<typeof user>;

        try {
            const url = await uploadProfilePicture(
                currentUser.uid,
                selectedPhoto,
            );
            await updateAuthPhotoURL(currentUser, url);
            await writeUserProfile(currentUser.uid, { photoURL: url });
            setSuccessMessage("Profile picture uploaded.");
            setSelectedPhoto(null);
            await refreshProfile();
        } catch (error) {
            console.error(error);
            setPhotoError(
                error instanceof Error
                    ? error.message
                    : "Unable to upload photo.",
            );
        }
    }

    async function handleEmailUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!newEmail.trim() || !currentPasswordForEmail) {
            setErrorMessage("Both email and current password are required.");
            return;
        }

        const currentUser = user as NonNullable<typeof user>;

        try {
            await reauthenticateUser(currentUser, currentPasswordForEmail);
            await updateAuthEmail(currentUser, newEmail.trim());
            await writeUserProfile(currentUser.uid, {
                email: newEmail.trim(),
                emailLowercase: newEmail.trim().toLowerCase(),
            });
            setSuccessMessage("Email updated successfully.");
            setCurrentPasswordForEmail("");
            setUser(fireBaseAuth.currentUser);
            await refreshProfile();
        } catch (error) {
            console.error(error);
            setErrorMessage(
                "Unable to update email. Check your password and try again.",
            );
        }
    }

    async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setErrorMessage("All password fields are required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("New passwords do not match.");
            return;
        }

        const currentUser = user as NonNullable<typeof user>;

        try {
            await reauthenticateUser(currentUser, currentPassword);
            await updateAuthPassword(currentUser, newPassword);
            setSuccessMessage("Password updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error(error);
            setErrorMessage(
                "Unable to update password. Check your current password and try again.",
            );
        }
    }

    async function handleSearchUsers() {
        setErrorMessage(null);
        setSuccessMessage(null);
        setSearchResults([]);
        if (!searchTerm.trim()) {
            return;
        }

        try {
            const results = await searchUsers(searchTerm.trim());
            setSearchResults(results.slice(0, MAX_SEARCH_RESULTS));
            if (!results.length) {
                setErrorMessage("No matching users found.");
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("Unable to search users right now.");
        }
    }

    async function handleSendRequest(targetUid: string) {
        setErrorMessage(null);
        setSuccessMessage(null);
        setRequesting(true);

        const currentUser = user as NonNullable<typeof user>;

        try {
            await sendFriendRequest(currentUser.uid, targetUid);
            setSuccessMessage("Friend request sent.");
            await refreshProfile();
        } catch (error) {
            console.error(error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to send friend request.",
            );
        } finally {
            setRequesting(false);
        }
    }

    async function handleAcceptRequest(request: {
        requestKey: string;
        from: string;
        requester: PublicProfile;
    }) {
        setErrorMessage(null);
        setSuccessMessage(null);

        const previousIncoming = incomingRequests;
        const previousFriends = friends;

        setIncomingRequests((requests) =>
            requests.filter((item) => item.requestKey !== request.requestKey),
        );
        setFriends((existingFriends) => {
            if (existingFriends.some((friend) => friend.uid === request.from)) {
                return existingFriends;
            }
            return [...existingFriends, request.requester];
        });

        try {
            await acceptFriendRequestByKey(request.requestKey);
            setSuccessMessage("Friend request accepted.");
            await refreshProfile();
        } catch (error) {
            console.error(error);
            setIncomingRequests(previousIncoming);
            setFriends(previousFriends);
            setErrorMessage("Unable to accept friend request.");
        }
    }

    async function handleDenyRequest(request: { requestKey: string }) {
        setErrorMessage(null);
        setSuccessMessage(null);

        const previousIncoming = incomingRequests;

        setIncomingRequests((requests) =>
            requests.filter((item) => item.requestKey !== request.requestKey),
        );

        try {
            await denyFriendRequestByKey(request.requestKey);
            setSuccessMessage("Friend request denied.");
            await refreshProfile();
        } catch (error) {
            console.error(error);
            setIncomingRequests(previousIncoming);
            setErrorMessage("Unable to deny friend request.");
        }
    }

    async function handleRemoveFriend(friendUid: string) {
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            await removeFriend(friendUid);
            setSuccessMessage("Friend removed.");
            await refreshProfile();
            setSelectedFriend(null);
        } catch (error) {
            console.error(error);
            setErrorMessage("Unable to remove friend.");
        }
    }

    async function openFriendPreview(uid: string) {
        const friendProfile = await getUserProfile(uid);
        if (friendProfile) {
            setSelectedFriend({
                uid: friendProfile.uid,
                displayName: friendProfile.displayName,
                email: friendProfile.email,
                photoURL: friendProfile.photoURL,
            });
        }
    }

    return (
        <div className={styles.profileCt}>
            <h1>Profile</h1>
            {isLoading ? (
                <div className={styles.loading}>Loading profile...</div>
            ) : (
                <>
                    <div className={styles.statusBar}>
                        {errorMessage && (
                            <p className={styles.error}>{errorMessage}</p>
                        )}
                        {successMessage && (
                            <p className={styles.success}>{successMessage}</p>
                        )}
                    </div>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Account summary</h2>
                        </div>
                        <div className={styles.profileSummary}>
                            <img
                                className={styles.avatar}
                                src={
                                    photoPreview ||
                                    publicProfile?.photoURL ||
                                    "/assets/default-avatar.png"
                                }
                                alt="Profile avatar"
                            />
                            <div>
                                <p>
                                    <strong>Name:</strong>{" "}
                                    {publicProfile?.displayName || "—"}
                                </p>
                                <p>
                                    <strong>Email:</strong>{" "}
                                    {publicProfile?.email || user.email}
                                </p>
                                <p>
                                    <strong>UID:</strong> {user.uid.slice(0, 8)}
                                    ...
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Edit profile</h2>
                        </div>
                        <form
                            className={styles.form}
                            onSubmit={handleDisplayNameUpdate}>
                            <label>
                                Display name
                                <input
                                    value={displayNameInput}
                                    onChange={(e) =>
                                        setDisplayNameInput(e.target.value)
                                    }
                                    placeholder="Your display name"
                                />
                            </label>
                            <button type="submit">Save display name</button>
                        </form>
                        <form
                            className={styles.form}
                            onSubmit={handlePhotoUpload}>
                            <label>
                                Profile picture
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoSelected}
                                />
                            </label>
                            {photoError && (
                                <p className={styles.error}>{photoError}</p>
                            )}
                            <button type="submit" disabled={!selectedPhoto}>
                                Upload picture
                            </button>
                            <p className={styles.helperText}>
                                Allowed: JPG, PNG, WEBP. Max size 2 MB.
                            </p>
                        </form>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Security</h2>
                        </div>
                        <form
                            className={styles.form}
                            onSubmit={handleEmailUpdate}>
                            <label>
                                New email
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) =>
                                        setNewEmail(e.target.value)
                                    }
                                    placeholder="new@example.com"
                                />
                            </label>
                            <label>
                                Current password
                                <input
                                    type="password"
                                    value={currentPasswordForEmail}
                                    onChange={(e) =>
                                        setCurrentPasswordForEmail(
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Current password"
                                />
                            </label>
                            <button type="submit">Update email</button>
                        </form>
                        <form
                            className={styles.form}
                            onSubmit={handlePasswordUpdate}>
                            <label>
                                Current password
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    placeholder="Current password"
                                />
                            </label>
                            <label>
                                New password
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    placeholder="New password"
                                />
                            </label>
                            <label>
                                Confirm new password
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Confirm new password"
                                />
                            </label>
                            <button type="submit">Update password</button>
                        </form>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Friends</h2>
                        </div>
                        <div className={styles.grid}>
                            <div className={styles.card}>
                                <h3>Find friends</h3>
                                <div className={styles.form}>
                                    <input
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        placeholder="Search by email or display name"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSearchUsers}>
                                        Search
                                    </button>
                                </div>
                                <div className={styles.searchResults}>
                                    {searchResults.map((result) => (
                                        <div
                                            key={result.uid}
                                            className={styles.resultRow}>
                                            <div>
                                                <p>
                                                    {result.displayName ||
                                                        "Unnamed"}
                                                </p>
                                                <p className={styles.small}>
                                                    {result.email || "No email"}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSendRequest(
                                                        result.uid,
                                                    )
                                                }
                                                disabled={requesting}>
                                                Send request
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.card}>
                                <h3>Incoming requests</h3>
                                {incomingRequests.length ? (
                                    incomingRequests.map((req) => (
                                        <div
                                            key={req.requestKey}
                                            className={styles.resultRow}>
                                            <div>
                                                <p>
                                                    {req.requester
                                                        .displayName ||
                                                        req.requester.email ||
                                                        `${req.from.slice(0, 8)}...`}
                                                </p>
                                                {req.requester.email && (
                                                    <p className={styles.small}>
                                                        {req.requester.email}
                                                    </p>
                                                )}
                                            </div>
                                            <div className={styles.rowButtons}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleAcceptRequest(req)
                                                    }>
                                                    Accept
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDenyRequest(req)
                                                    }>
                                                    Deny
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.small}>
                                        No pending requests.
                                    </p>
                                )}
                            </div>

                            <div className={styles.card}>
                                <h3>Friends</h3>
                                {friends.length ? (
                                    friends.map((friend) => (
                                        <div
                                            key={friend.uid}
                                            className={styles.resultRow}>
                                            <div>
                                                <p>
                                                    {friend.displayName ||
                                                        friend.email ||
                                                        `${friend.uid.slice(0, 8)}...`}
                                                </p>
                                                {friend.email && (
                                                    <p className={styles.small}>
                                                        {friend.email}
                                                    </p>
                                                )}
                                            </div>
                                            <div className={styles.rowButtons}>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openFriendPreview(
                                                            friend.uid,
                                                        )
                                                    }>
                                                    View profile
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveFriend(
                                                            friend.uid,
                                                        )
                                                    }>
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.small}>
                                        No friends yet.
                                    </p>
                                )}
                            </div>
                        </div>

                        {selectedFriend && (
                            <div className={styles.card}>
                                <h3>Friend profile</h3>
                                <div className={styles.profileSummary}>
                                    <img
                                        className={styles.avatarSmall}
                                        src={
                                            selectedFriend.photoURL ||
                                            "/assets/default-avatar.png"
                                        }
                                        alt="Friend avatar"
                                    />
                                    <div>
                                        <p>
                                            <strong>
                                                {selectedFriend.displayName ||
                                                    "Unnamed"}
                                            </strong>
                                        </p>
                                        <p className={styles.small}>
                                            {selectedFriend.email ||
                                                "Private email"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFriend(null)}>
                                    Close preview
                                </button>
                            </div>
                        )}
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Statistics</h2>
                        </div>
                        <div className={styles.card}>
                            {profile?.stats &&
                            Object.keys(profile.stats).length ? (
                                <div className={styles.statsGrid}>
                                    {Object.entries(profile.stats).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className={styles.statBlock}>
                                                <span>{key}</span>
                                                <strong>{value}</strong>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <p>Statistics coming soon.</p>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
