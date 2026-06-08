import { create } from "zustand";
import type { User } from "firebase/auth";

interface authStore {
    user: User | null;
    isLoading: boolean;

    setUser: (user: User | null) => void;
}

const AuthStore = create<authStore>((set) => ({
    user: null,
    isLoading: true,

    setUser: (user) => set({ user, isLoading: false }),
}));

export default AuthStore;
