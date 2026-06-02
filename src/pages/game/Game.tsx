import { useParams } from "react-router";

export default function Game() {
    const { gameId } = useParams();

    return <h1>Game</h1>;
}
