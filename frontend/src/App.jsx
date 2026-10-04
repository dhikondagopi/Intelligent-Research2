import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

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


function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}


function AppContent() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 font-sans antialiased">
      <Routes>

        {/* Public Authentication Pages (Without Sidebar Layout) */}

        <Route
          path="/"
          element={<Login />}
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