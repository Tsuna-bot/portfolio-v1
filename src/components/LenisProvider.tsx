import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

interface LenisProviderProps {
  children: React.ReactNode;
}

export const LenisProvider: React.FC<LenisProviderProps> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Détruire l'instance précédente si elle existe
    if (lenisRef.current) {
      lenisRef.current.destroy();
      lenisRef.current = null;
    }

    // Ne gérer que la page principale
    const isMainPage = location.pathname === "/";

    if (isMainPage) {
      // Configuration pour la page principale
      document.body.style.overflowY = "hidden";
      document.body.style.height = "100vh";
      document.documentElement.style.overflowY = "hidden";

      // Initialiser Lenis pour la page principale
      lenisRef.current = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.8,
        touchMultiplier: 2,
        infinite: false,
      });

      // Fonction de rafraîchissement
      function raf(time: number) {
        lenisRef.current?.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
    } else {
      // Pour les pages de projets, laisser le scroll natif
      document.body.style.overflowY = "auto";
      document.body.style.height = "auto";
      document.documentElement.style.overflowY = "auto";
    }

    // Cleanup
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, [location.pathname]);

  return <>{children}</>;
};
