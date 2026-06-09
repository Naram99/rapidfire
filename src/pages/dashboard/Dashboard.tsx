import { Link, useNavigate } from "react-router";
import styles from "./dashboard.module.css";
import { fireBaseAuth, fireBaseFunctions } from "../../firebase";
import { useState } from "react";
import { httpsCallable } from "firebase/functions";

type LobbyResponse = {
    status: number;
    lobbyId?: string;
    message?: string;
};

export default function Dashboard() {
    const navigate = useNavigate();
    const auth = fireBaseAuth;
    const functions = fireBaseFunctions;

    const [lobbyCode, setLobbyCode] = useState("");
    const [error, setError] = useState<string | null>(null);

    function handleLobbyChange(e: React.ChangeEvent<HTMLInputElement>) {
        setError(null);
        setLobbyCode(e.currentTarget.value.trim());
    }

    async function handleCreateLobby() {
        const createLobby = httpsCallable(functions, "createLobby");

        createLobby()
            .then((result) => {
                if (result.data) {
                    const response = result.data as LobbyResponse;
                    if (response.status !== 201 || !response.lobbyId) {
                        throw new Error("Not valid response");
                    }

                    navigate(`/lobby/${response.lobbyId}`);
                }
            })
            .catch((err) => {
                console.error(err);
                setError("Cannot create lobby");
            });
    }

    async function handleJoinLobby() {}

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
