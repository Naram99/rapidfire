import { Link, useNavigate } from "react-router";
import styles from "./dashboard.module.css";
import { fireBaseAuth, fireBaseFunctions } from "../../firebase";
import { useState } from "react";
import { httpsCallable } from "firebase/functions";

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
        const createRoom = httpsCallable(functions, "createRoom");

        createRoom()
            .then((result) => {
                if (result.data) {
                    console.log(result.data);
                }
            })
            .catch((err) => {
                console.error(err);
                setError("Cannot create room");
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
            <button onClick={handleCreateLobby}>Create lobby</button>
            <div>
                <input
                    type="text"
                    placeholder="Lobby code"
                    onChange={handleLobbyChange}
                    value={lobbyCode}
                />
                <button onClick={handleJoinLobby}>Join lobby</button>
            </div>
            <div className={styles.errorCt}>{error && <p>{error}</p>}</div>
            <Link to="/profile">
                <button>Profile</button>
            </Link>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}
