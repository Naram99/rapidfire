import { create } from "zustand";

interface gameStore {}

const GameStore = create<gameStore>((set) => ({}));

export default GameStore;
