import { useEffect } from "react";
import AuthStore from "../../zustand/authStore";
import styles from "./lobby.module.css";
import { useNavigate, useParams } from "react-router";
import { checkIfUserInLobby, checkLobbyExists } from "./validateLobby";

export default function Lobby() {
    const { lobbyId } = useParams();
    const navigate = useNavigate();

    const user = AuthStore((state) => state.user);

    useEffect(() => {
        if (!lobbyId) navigate("/dashboard", { replace: true });

        async function checkUserInLobby(lobbyId: string) {
            try {
                if (!checkLobbyExists(lobbyId)) {
                    throw new Error("Lobby does not exist.");
                }

                if (!checkIfUserInLobby(lobbyId, user!.uid)) {
                    throw new Error("User did not join Lobby correctly.");
                }

                console.log(`${user!.uid} joined ${lobbyId}`);
            } catch (err) {
                console.error(err);
                navigate("/dashboard", { replace: true });
            }
        }

        checkUserInLobby(lobbyId!);
    }, [lobbyId, navigate, user]);

    return (
        <div className={styles.lobbyCt}>
            <h1>Lobby</h1>
            <h2>Code: {lobbyId}</h2>
        </div>
    );
}
