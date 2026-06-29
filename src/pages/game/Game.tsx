import { useParams } from "react-router";

export default function Game() {
    const params = useParams();

    return <h1>Game {params.gameId ? `(${params.gameId})` : ""}</h1>;
}
