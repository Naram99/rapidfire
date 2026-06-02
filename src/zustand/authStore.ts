import { create } from "zustand";
import type { User } from "firebase/auth";

interface authStore {
    user: User | null;
}

const AuthStore = create<authStore>((set) => ({
    user: null,
}));

export default AuthStore;
