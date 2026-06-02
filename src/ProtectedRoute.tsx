import { Navigate, Outlet } from "react-router";
import AuthStore from "./zustand/authStore";

export default function ProtectedRoute() {
    const isLoggedIn = AuthStore((state) => state.user !== null);

    return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}
