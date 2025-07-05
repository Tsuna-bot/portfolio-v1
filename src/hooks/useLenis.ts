import { useEffect, useRef } from "react";
import Lenis from "lenis";

export const useLenis = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialiser Lenis avec des paramètres optimisés
    lenisRef.current = new Lenis({
      duration: 1.2, // Durée de l'animation de scroll
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing fluide
      orientation: "vertical", // Scroll vertical uniquement
      gestureOrientation: "vertical", // Gestures verticales uniquement
      smoothWheel: true, // Scroll fluide avec la molette
      wheelMultiplier: 0.8, // Multiplicateur de la molette légèrement réduit
      touchMultiplier: 2, // Multiplicateur tactile
      infinite: false, // Pas de scroll infini
    });

    // Fonction de rafraîchissement pour l'animation
    function raf(time: number) {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, []);

  return lenisRef.current;
};

// Hook spécialisé pour les pages de projets
export const useProjectLenis = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Forcer la configuration du body pour permettre le scroll
    document.body.style.overflowY = "auto";
    document.body.style.height = "auto";
    document.documentElement.style.overflowY = "auto";
    document.documentElement.style.height = "auto";

    // Attendre un peu pour que le DOM soit prêt
    const timer = setTimeout(() => {
      // Initialiser Lenis pour les pages de projets
      lenisRef.current = new Lenis({
        duration: 1.5,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.7,
        touchMultiplier: 1.5,
        infinite: false,
      });

      console.log("ProjectLenis: Instance créée", lenisRef.current);

      // Fonction de rafraîchissement
      function raf(time: number) {
        lenisRef.current?.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  return lenisRef.current;
};
