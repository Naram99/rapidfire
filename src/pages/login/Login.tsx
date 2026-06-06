import { useNavigate } from "react-router";
import styles from "./login.module.css";
import { useState } from "react";
import AuthStore from "../../zustand/authStore";

export default function Login() {
    const navigate = useNavigate();
    const user = AuthStore((state) => state.user);

    const [userMail, setUserMail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    if (user !== null) {
        navigate("/dashboard", { replace: true });
        return null;
    }

    function handleMailChange(e: React.ChangeEvent<HTMLInputElement>) {
        setUserMail(e.currentTarget.value);
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPassword(e.currentTarget.value);
    }

    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        // TODO: Login logic
    }

    return (
        <div className={styles.loginCt}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className={styles.inputCt}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        name="email"
                        id="email"
                        required
                        onChange={handleMailChange}
                        value={userMail}
                    />
                </div>
                <div className={styles.inputCt}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        required
                        onChange={handlePasswordChange}
                        value={password}
                    />
                </div>
                <div className={styles.errorCt}>{error && <p>{error}</p>}</div>
                <button type="submit">Log in</button>
            </form>
        </div>
    );
}
