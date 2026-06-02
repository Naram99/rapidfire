import { create } from "zustand";

interface roomStore {}

const RoomStore = create<roomStore>((set) => ({}));

export default RoomStore;
