export interface UserProfile {
    uid: string;
    email: string;
    emailLowercase: string;
    displayName?: string;
    displayNameLowercase?: string;
    photoURL?: string;
    stats?: Record<string, number>;
    friends?: Record<string, true>;
    incomingFriendRequests?: Record<string, true>;
    outgoingFriendRequests?: Record<string, true>;
}

export interface PublicProfile {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
}
