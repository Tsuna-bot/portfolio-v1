import React, { useState, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import UnifiedCanvas from "./components/UnifiedCanvas";
// import WorklyPage from "./pages/WorklyPage";
// import TrekksPage from "./pages/TrekksPage";
import CubeGamePage from "./pages/CubeGamePage";
import { LenisProvider } from "./components/LenisProvider";
import LoadingPage from "./components/LoadingPage";
import { usePreloader } from "./hooks/usePreloader";

const MIN_DISPLAY_TIME = 2000; // ms

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const { isLoaded } = usePreloader();

  // Délai minimum d'affichage de la loading page
  const [showLoading, setShowLoading] = useState(true);
  const loadingStartRef = useRef<number>(Date.now());

  // Correction : déclaration de heroTitlesShouldAnimate
  const [heroTitlesShouldAnimate] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      const elapsed = Date.now() - loadingStartRef.current;
      const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
      const timeout = setTimeout(() => {
        setShowLoading(false);
      }, remaining);
      return () => clearTimeout(timeout);
    }
  }, [isLoaded]);

  // Fonction de navigation avec loading page - DÉSACTIVÉE
  // const navigateWithTransition = (to: string) => {
  //   if (isLoading) return;
  //   setIsLoading(true);
  //   setPendingRoute(to);
  // };

  // Déterminer si on est sur la page principale
  const isMainPage = location.pathname === "/";
  const isProjectPage =
    location.pathname === "/workly" || location.pathname === "/trekks";

  // Fallback: si le préchargement prend trop de temps, afficher le contenu
  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Afficher la loading page si on est en train de naviguer
  if (isLoading) {
    return (
      <LoadingPage
        onLoadingComplete={() => {
          if (pendingRoute) {
            navigate(pendingRoute);
            setPendingRoute(null);
          }
          setIsLoading(false);
        }}
      />
    );
  }

  // Afficher la loading page initiale
  if ((showLoading || !isLoaded) && !showContent) {
    return (
      <LoadingPage
        onLoadingComplete={() => {
          setShowLoading(false);
        }}
      />
    );
  }

  return (
    <LenisProvider>
      <div
        className={`App ${isMainPage ? "main-page" : ""} ${
          isProjectPage ? "project-page" : ""
        }`}
      >
        <Routes>
          {/* Route principale avec le canvas 3D */}
          <Route
            path="/"
            element={
              <UnifiedCanvas
                heroTitlesShouldAnimate={heroTitlesShouldAnimate}
                showLoading={showLoading}
              />
            }
          />

          {/* Routes pour les pages de projets - DÉSACTIVÉES TEMPORAIREMENT */}
          {/* <Route
            path="/workly"
            element={
              <WorklyPage navigateWithTransition={navigateWithTransition} />
            }
          />
          <Route
            path="/trekks"
            element={
              <TrekksPage navigateWithTransition={navigateWithTransition} />
            }
          /> */}
          <Route path="/cube-game" element={<CubeGamePage />} />

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </LenisProvider>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
