import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Solo from "./pages/solo/Solo";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/profile/Profile";
import Lobby from "./pages/lobby/Lobby";
import Game from "./pages/game/Game";
import AuthStore from "./zustand/authStore";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { fireBaseAuth } from "./firebase";
import Loading from "./Loading";
import Update from "./pages/Update";

function App() {
    const isAuthLoading = AuthStore((state) => state.isLoading);
    const setUser = AuthStore((state) => state.setUser);
    const auth = fireBaseAuth;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("User logged in");
            } else {
                console.error("User not authenticated");
            }
            setUser(user);
        });

        return () => unsubscribe();
    }, [auth, setUser]);

    if (isAuthLoading) {
        return <Loading />;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="solo" element={<Solo />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="lobby/:lobbyId" element={<Lobby />} />
                    <Route path="game/:gameId" element={<Game />} />
                    <Route path="update" element={<Update />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
