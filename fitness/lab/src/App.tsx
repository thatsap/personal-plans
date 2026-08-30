import { Navigate, NavLink, Outlet, Route, Routes } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { readCloud } from "./lib/config";
import { getSupabase } from "./lib/supabase";
import Connect from "./pages/Connect";
import Login from "./pages/Login";
import Today from "./pages/Today";
import Add from "./pages/Add";
import Manual from "./pages/Manual";
import Json from "./pages/Json";
import Repeat from "./pages/Repeat";
import Review from "./pages/Review";

function Guard({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb) {
      setReady(true);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!readCloud()) return <Navigate to="/connect" replace />;
  if (!ready) return <p className="wrap muted">Establishing link…</p>;
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

function Shell() {
  return (
    <>
      <Outlet />
      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
          Today
        </NavLink>
        <NavLink to="/add" className={({ isActive }) => (isActive ? "active" : "")}>
          Log
        </NavLink>
        <NavLink to="/review" className={({ isActive }) => (isActive ? "active" : "")}>
          AAR
        </NavLink>
      </nav>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/connect" element={<Connect />} />
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Guard>
            <Shell />
          </Guard>
        }
      >
        <Route path="/" element={<Today />} />
        <Route path="/add" element={<Add />} />
        <Route path="/add/manual" element={<Manual />} />
        <Route path="/add/json" element={<Json />} />
        <Route path="/add/repeat" element={<Repeat />} />
        <Route path="/review" element={<Review />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
