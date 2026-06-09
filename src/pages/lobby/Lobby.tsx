import styles from "./lobby.module.css";
import { useParams } from "react-router";

export default function Lobby() {
    const { lobbyId } = useParams();

    return (
        <div className={styles.lobbyCt}>
            <h1>Lobby</h1>
            <h2>Code {lobbyId}</h2>
        </div>
    );
}
