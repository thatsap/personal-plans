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
import RecToday from "./pages/recovery/Today";
import SleepLog from "./pages/recovery/Sleep";
import MobilityHub from "./pages/recovery/Mobility";
import MobilityLive from "./pages/recovery/MobilityLive";
import RecReview from "./pages/recovery/Review";
import Prompts from "./pages/Prompts";
import Bin from "./pages/Bin";
import EditMeal from "./pages/EditMeal";
import EditSession from "./pages/workout/EditSession";
import EditSport from "./pages/workout/EditSport";
import EditRoutine from "./pages/workout/EditRoutine";
import EditSleep from "./pages/recovery/EditSleep";
import Body from "./pages/Body";
import EditMobility from "./pages/recovery/EditMobility";
import LabIndex from "./pages/lab/Index";
import LabArticle from "./pages/lab/Article";
import { purgeExpired } from "./lib/recycle";

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
      const uid = data.session?.user.id;
      if (uid) void purgeExpired(uid);
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

function RecoverShell() {
  return (
    <>
      <Outlet />
      <nav className="nav cols-5">
        <NavLink to="/" end>
          Lab
        </NavLink>
        <NavLink to="/recover" end>
          Today
        </NavLink>
        <NavLink to="/recover/sleep">Sleep</NavLink>
        <NavLink to="/recover/move">Move</NavLink>
        <NavLink to="/recover/review">AAR</NavLink>
      </nav>
    </>
  );
}

function LabShell() {
  return (
    <>
      <Outlet />
      <nav className="nav cols-4">
        <NavLink to="/" end>
          Hub
        </NavLink>
        <NavLink to="/lab">Lab</NavLink>
        <NavLink to="/fuel">Fuel</NavLink>
        <NavLink to="/train">Train</NavLink>
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
        <Route path="/body" element={<Body />} />
        <Route path="/export" element={<ExportDay />} />
        <Route path="/prompts" element={<Prompts />} />
        <Route path="/bin" element={<Bin />} />
        <Route path="/train/live/:routineId" element={<WorkoutLive />} />
        <Route path="/recover/move/:routineKey" element={<MobilityLive />} />
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
        <Route path="/fuel/item/:id" element={<EditMeal />} />
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
        <Route path="/train/session/:id" element={<EditSession />} />
        <Route path="/train/sport/:id" element={<EditSport />} />
        <Route path="/train/routine/:id" element={<EditRoutine />} />
      </Route>
      <Route
        element={
          <Guard>
            <RecoverShell />
          </Guard>
        }
      >
        <Route path="/recover" element={<RecToday />} />
        <Route path="/recover/sleep" element={<SleepLog />} />
        <Route path="/recover/sleep/:id" element={<EditSleep />} />
        <Route path="/recover/move" element={<MobilityHub />} />
        <Route path="/recover/mobility/:id" element={<EditMobility />} />
        <Route path="/recover/review" element={<RecReview />} />
      </Route>
      <Route
        element={
          <Guard>
            <LabShell />
          </Guard>
        }
      >
        <Route path="/lab" element={<LabIndex />} />
        <Route path="/lab/:slug" element={<LabArticle />} />
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
