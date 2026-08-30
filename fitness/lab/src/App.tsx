import { Navigate, NavLink, Outlet, Route, Routes } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { readCloud } from "./lib/config";
import { getSupabase } from "./lib/supabase";
import Connect from "./pages/Connect";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Today from "./pages/Today";
import Add from "./pages/Add";
import Manual from "./pages/Manual";
import Json from "./pages/Json";
import Repeat from "./pages/Repeat";
import Review from "./pages/Review";
import ExportDay from "./pages/ExportDay";
import WorkoutHub from "./pages/workout/Hub";
import WorkoutJson from "./pages/workout/Json";
import WorkoutRepeat from "./pages/workout/Repeat";
import WorkoutManual from "./pages/workout/Manual";
import WorkoutLive from "./pages/workout/Live";
import TrainToday from "./pages/workout/TrainToday";
import SportsLog from "./pages/workout/Sports";
import TrainReview from "./pages/workout/TrainReview";

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

function FuelShell() {
  return (
    <>
      <Outlet />
      <nav className="nav cols-4">
        <NavLink to="/" end>
          Lab
        </NavLink>
        <NavLink to="/fuel" end>
          Today
        </NavLink>
        <NavLink to="/fuel/add">Log</NavLink>
        <NavLink to="/fuel/review">AAR</NavLink>
      </nav>
    </>
  );
}

function TrainShell() {
  return (
    <>
      <Outlet />
      <nav className="nav cols-5">
        <NavLink to="/" end>
          Lab
        </NavLink>
        <NavLink to="/train" end>
          Today
        </NavLink>
        <NavLink to="/train/add">Lift</NavLink>
        <NavLink to="/train/sports">Sport</NavLink>
        <NavLink to="/train/review">AAR</NavLink>
      </nav>
    </>
  );
}

function BareShell() {
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/connect" element={<Connect />} />
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <Guard>
            <BareShell />
          </Guard>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/export" element={<ExportDay />} />
        <Route path="/train/live/:routineId" element={<WorkoutLive />} />
      </Route>
      <Route
        element={
          <Guard>
            <FuelShell />
          </Guard>
        }
      >
        <Route path="/fuel" element={<Today />} />
        <Route path="/fuel/add" element={<Add />} />
        <Route path="/fuel/manual" element={<Manual />} />
        <Route path="/fuel/json" element={<Json />} />
        <Route path="/fuel/repeat" element={<Repeat />} />
        <Route path="/fuel/review" element={<Review />} />
      </Route>
      <Route
        element={
          <Guard>
            <TrainShell />
          </Guard>
        }
      >
        <Route path="/train" element={<TrainToday />} />
        <Route path="/train/add" element={<WorkoutHub />} />
        <Route path="/train/json" element={<WorkoutJson />} />
        <Route path="/train/repeat" element={<WorkoutRepeat />} />
        <Route path="/train/manual" element={<WorkoutManual />} />
        <Route path="/train/sports" element={<SportsLog />} />
        <Route path="/train/review" element={<TrainReview />} />
      </Route>
      <Route path="/add" element={<Navigate to="/fuel/add" replace />} />
      <Route path="/add/json" element={<Navigate to="/fuel/json" replace />} />
      <Route path="/add/repeat" element={<Navigate to="/fuel/repeat" replace />} />
      <Route path="/add/manual" element={<Navigate to="/fuel/manual" replace />} />
      <Route path="/review" element={<Navigate to="/fuel/review" replace />} />
      <Route path="/add/workout" element={<Navigate to="/train/add" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
