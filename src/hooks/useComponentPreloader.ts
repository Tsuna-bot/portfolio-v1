import { useEffect, useState } from "react";

const useComponentPreloader = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const preloadComponents = async () => {
      try {
        // Précharger Three.js
        await import("three");

        // Précharger React Three Fiber
        await import("@react-three/fiber");

        // Précharger React Three Drei
        await import("@react-three/drei");

        // Précharger Splitting.js et l'attacher à window
        const Splitting = await import("splitting");
        if (typeof window !== "undefined") {
          (window as unknown as { Splitting?: unknown }).Splitting =
            Splitting.default || Splitting;
        }

        // Précharger Lenis
        await import("lenis");

        // Attendre un peu pour la stabilité
        setTimeout(() => {
          setIsReady(true);
        }, 200); // Réduit de 500ms à 200ms
      } catch (error) {
        console.warn("Erreur lors du préchargement:", error);
        setIsReady(true); // Continuer même en cas d'erreur
      }
    };

    preloadComponents();
  }, []);

  return { isReady };
};

export default useComponentPreloader;
