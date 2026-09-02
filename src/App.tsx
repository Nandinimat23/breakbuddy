import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { useOnboarding } from "./hooks/useLocalStorageFlag";
import { Onboarding } from "./pages/Onboarding/Onboarding";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { GameSelection } from "./pages/GameSelection/GameSelection";
import { GamePlay } from "./pages/GamePlay/GamePlay";
import { Settings } from "./pages/Settings/Settings";

function RequireOnboarding({ children }: { children: React.ReactElement }) {
  const { onboarded } = useOnboarding();
  return onboarded ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route
          path="/dashboard"
          element={
            <RequireOnboarding>
              <Dashboard />
            </RequireOnboarding>
          }
        />
        <Route
          path="/break"
          element={
            <RequireOnboarding>
              <GameSelection />
            </RequireOnboarding>
          }
        />
        <Route
          path="/break/:gameId"
          element={
            <RequireOnboarding>
              <GamePlay />
            </RequireOnboarding>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireOnboarding>
              <Settings />
            </RequireOnboarding>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppProvider>
  );
}
