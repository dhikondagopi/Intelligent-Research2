import React, { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// Eagerly loaded public entry points and shared layout
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppLayout from "./components/AppLayout";
import { ThemeProvider } from "./context/ThemeContext";

// Lazy-loaded intelligence and dashboard modules for route-level code splitting
const Profile = lazy(() => import("./pages/Profile"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const ResearchIntelligence = lazy(() => import("./pages/ResearchIntelligence"));
const FundingIntelligence = lazy(() => import("./pages/FundingIntelligence"));
const PatentIntelligence = lazy(() => import("./pages/PatentIntelligence"));
const TechnologyDashboard = lazy(() => import("./pages/TechnologyDashboard"));
const EmergingTechnologies = lazy(() => import("./pages/EmergingTechnologies"));
const TechnologyDetails = lazy(() => import("./pages/TechnologyDetails"));
const InnovationScoring = lazy(() => import("./pages/InnovationScoring"));
const InnovationDetails = lazy(() => import("./pages/InnovationDetails"));
const Commercialization = lazy(() => import("./pages/Commercialization"));
const RoleDashboard = lazy(() => import("./pages/RoleDashboard"));
const Reports = lazy(() => import("./pages/Reports"));

// Robust Error Boundary to gracefully catch lazy-loading failures
class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentCatch(error, errorInfo) {
    console.error("Route chunk loading error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <div className="p-4 rounded-full bg-red-500/10 text-red-500 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Failed to load view</h2>
          <p className="text-sm opacity-70 mb-4 max-w-md">
            The requested intelligence module could not be loaded. This might be due to a network interruption or an updated deployment.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition"
          >
            Reload View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Consistent loading skeleton for seamless lazy route transitions
function PageLoadingFallback() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[65vh] p-8 text-center"
      role="status"
      aria-label="Loading intelligence data"
    >
      <div className="relative w-12 h-12 mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 animate-ping absolute inset-0" />
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin relative" />
      </div>
      <p className="text-sm font-medium tracking-wide opacity-75">
        Loading intelligence module...
      </p>
    </div>
  );
}

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
      <PageErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            {/* Public Marketing Website & Auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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
        </Suspense>
      </PageErrorBoundary>
    </div>
  );
}

export default App;