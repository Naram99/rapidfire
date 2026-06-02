import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import Solo from "./pages/solo/Solo";
import ProtectedRoute from "./ProtectedRoute";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/profile/Profile";
import Room from "./pages/room/Room";
import Game from "./pages/game/Game";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="solo" element={<Solo />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="room/:roomId" element={<Room />} />
                    <Route path="game/:gameId" element={<Game />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

