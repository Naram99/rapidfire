import { Link, useNavigate } from "react-router";
import styles from "./dashboard.module.css";
import { fireBaseAuth } from "../../firebase";
import { useState } from "react";
import LobbyStore from "../../zustand/lobbyStore";
import GameStore from "../../zustand/gameStore";

export default function Dashboard() {
    const navigate = useNavigate();
    const auth = fireBaseAuth;

    const createGame = GameStore((state) => state.createGame);

    const createLobby = LobbyStore((state) => state.createLobby);
    const joinLobby = LobbyStore((state) => state.joinLobby);

    const [lobbyCode, setLobbyCode] = useState("");
    const [error, setError] = useState<string | null>(null);

    function handleLobbyChange(e: React.ChangeEvent<HTMLInputElement>) {
        setError(null);
        setLobbyCode(e.currentTarget.value.trim());
    }

    async function handleCreateLobby() {
        try {
            const lobbyId = await createLobby();
            navigate(`/lobby/${lobbyId}`);
        } catch (err) {
            console.error(err);
            setError("Cannot create lobby");
        }
    }

    async function handleJoinLobby() {
        try {
            const lobbyId = await joinLobby(lobbyCode);
            navigate(`/lobby/${lobbyId}`);
        } catch (err) {
            console.error(err);
            setError("Cannot join lobby");
        }
    }

    async function handleCreateGame() {
        try {
            await createGame();
            navigate("/solo");
        } catch (err) {
            console.error(err);
            setError("Cannot create game");
        }
    }

    function handleLogout() {
        auth.signOut()
            .then(() => {
                navigate("/", { replace: true });
            })
            .catch((error) => {
                console.error("Error signing out: ", error);
            });
    }

    return (
        <div className={styles.dashboardCt}>
            <h1>Dashboard</h1>
            <Link to="/solo">
                <button type="button" onClick={handleCreateGame}>
                    Solo play
                </button>
            </Link>
            <button type="button" onClick={handleCreateLobby}>
                Create lobby
            </button>
            <div className={styles.joinLobby}>
                <input
                    type="text"
                    placeholder="Lobby code"
                    onChange={handleLobbyChange}
                    value={lobbyCode}
                />
                <button type="button" onClick={handleJoinLobby}>
                    Join lobby
                </button>
            </div>
            <div className="errorCt">{error && <p>{error}</p>}</div>
            <Link to="/profile">
                <button type="button">Profile</button>
            </Link>
            <button type="button" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}
