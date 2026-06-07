import { useNavigate } from "react-router";
import styles from "./login.module.css";
import { useState } from "react";
import AuthStore from "../../zustand/authStore";

export default function Login() {
    const navigate = useNavigate();
    const user = AuthStore((state) => state.user);

    const [userMail, setUserMail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    if (user !== null) {
        navigate("/dashboard", { replace: true });
        return null;
    }

    function handleMailChange(e: React.ChangeEvent<HTMLInputElement>) {
        setUserMail(e.currentTarget.value.trim());
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        setPassword(e.currentTarget.value.trim());
    }

    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();

        // TODO: Login logic
        if (!userMail || !password) {
            setError("Please fill both the email and password fields.");
            return;
        }
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
