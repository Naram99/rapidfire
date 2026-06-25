import GameStore from "../../zustand/gameStore";
import Loading from "../../Loading";

export default function Solo() {
    const game = GameStore((state) => state.game);
    const isGameLoading = GameStore((state) => state.isLoading);

    if (isGameLoading) {
        return <Loading />;
    }

    return (
        <div>
            <h1>Solo play</h1>
            <h2>{game?.id}</h2>
        </div>
    );
}
