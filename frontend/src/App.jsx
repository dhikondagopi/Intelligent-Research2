import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import SearchResults from "./pages/SearchResults";

import AppLayout from "./components/AppLayout";

import ResearchIntelligence from "./pages/ResearchIntelligence";
import FundingIntelligence from "./pages/FundingIntelligence";
import PatentIntelligence from "./pages/PatentIntelligence";

import TechnologyDashboard from "./pages/TechnologyDashboard";
import EmergingTechnologies from "./pages/EmergingTechnologies";
import TechnologyDetails from "./pages/TechnologyDetails";

import InnovationScoring from "./pages/InnovationScoring";
import InnovationDetails from "./pages/InnovationDetails";

import Commercialization from "./pages/Commercialization";

import RoleDashboard from "./pages/RoleDashboard";
import Reports from "./pages/Reports";


import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}


function AppContent() {
  return (
    <div
      className="min-h-screen font-sans antialiased"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      <Routes>

        {/* Public Marketing Website */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Authenticated Application Pages (Wrapped with Left Sidebar Layout) */}

        <Route
          path="/profile"
          element={
            <AppLayout>
              <Profile />
            </AppLayout>
          }
        />

        <Route
          path="/search"
          element={
            <AppLayout>
              <SearchResults />
            </AppLayout>
          }
        />

        <Route
          path="/research"
          element={
            <AppLayout>
              <ResearchIntelligence />
            </AppLayout>
          }
        />

        <Route
          path="/funding"
          element={
            <AppLayout>
              <FundingIntelligence />
            </AppLayout>
          }
        />

        <Route
          path="/patents"
          element={
            <AppLayout>
              <PatentIntelligence />
            </AppLayout>
          }
        />

        <Route
          path="/technology"
          element={
            <AppLayout>
              <TechnologyDashboard />
            </AppLayout>
          }
        />

        <Route
          path="/technology/emerging"
          element={
            <AppLayout>
              <EmergingTechnologies />
            </AppLayout>
          }
        />

        <Route
          path="/technology/:technology"
          element={
            <AppLayout>
              <TechnologyDetails />
            </AppLayout>
          }
        />

        <Route
          path="/innovation"
          element={
            <AppLayout>
              <InnovationScoring />
            </AppLayout>
          }
        />

        <Route
          path="/innovation/:technology"
          element={
            <AppLayout>
              <InnovationDetails />
            </AppLayout>
          }
        />

        <Route
          path="/commercialization/:technology"
          element={
            <AppLayout>
              <Commercialization />
            </AppLayout>
          }
        />

        <Route
          path="/dashboard/:role"
          element={
            <AppLayout>
              <RoleDashboard />
            </AppLayout>
          }
        />

        <Route
          path="/reports"
          element={
            <AppLayout>
              <Reports />
            </AppLayout>
          }
        />

      </Routes>
    </div>
  );
}

export default App;