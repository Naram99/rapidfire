import { Navigate } from "react-router";
import styles from "./login.module.css";
import { useState } from "react";
import AuthStore from "../../zustand/authStore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { fireBaseAuth } from "../../firebase";

export default function Login() {
    const user = AuthStore((state) => state.user);

    const [userMail, setUserMail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const auth = fireBaseAuth;

    if (user !== null) {
        return <Navigate to="/dashboard" replace />;
    }

    function handleMailChange(e: React.ChangeEvent<HTMLInputElement>) {
        setError(null);
        setUserMail(e.currentTarget.value.trim());
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        setError(null);
        setPassword(e.currentTarget.value.trim());
    }

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        // TODO: Login logic
        if (!userMail || !password) {
            setError("Please fill both the email and password fields.");
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, userMail, password);
        } catch (error) {
            console.error(error);
            setError("Wrong credentials");
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
                <div className="errorCt">{error && <p>{error}</p>}</div>
                <button type="submit">Log in</button>
            </form>
        </div>
    );
}
