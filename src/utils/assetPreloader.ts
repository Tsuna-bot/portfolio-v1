// Types pour les bibliothèques externes
interface ExternalLibrary {
  name: string;
  check: () => boolean;
}

// Extension de Window pour les bibliothèques externes
declare global {
  interface Window {
    Splitting?: unknown;
    Lenis?: unknown;
    THREE?: unknown;
  }
}

// Utilitaire pour précharger tous les assets critiques
export const preloadCriticalAssets = async (): Promise<void> => {
  const assets = [
    // Images
    "/src/assets/logo-jn.svg",
    "/src/assets/projects/logo-trekks.svg",
    "/src/assets/projects/logo-workly.svg",
    // Fonts
    "/public/fonts/helvetiker_regular.typeface.json",
  ];

  const preloadPromises = assets.map((src) => {
    if (src.endsWith(".json")) {
      // Pour les fichiers JSON (fonts)
      return fetch(src).then(() => Promise.resolve());
    } else {
      // Pour les images
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = src;
      });
    }
  });

  try {
    await Promise.all(preloadPromises);
    console.log("✅ Tous les assets critiques préchargés");
  } catch (error) {
    console.warn("⚠️ Erreur lors du préchargement des assets:", error);
  }
};

// Précharger les géométries Three.js communes
export const preloadThreeJSGeometries = async (): Promise<void> => {
  try {
    const { BoxGeometry, SphereGeometry, PlaneGeometry, CylinderGeometry } =
      await import("three");

    // Créer des géométries de base pour précharger
    const geometries = [
      new BoxGeometry(1, 1, 1),
      new SphereGeometry(1, 32, 32),
      new PlaneGeometry(10, 10),
      new CylinderGeometry(1, 1, 2, 32),
    ];

    // Forcer la compilation en créant des meshes temporaires
    const { MeshBasicMaterial } = await import("three");
    const material = new MeshBasicMaterial({ color: 0xff0000 });

    const { Mesh } = await import("three");
    geometries.forEach((geometry) => {
      new Mesh(geometry, material);
    });

    // Nettoyer
    geometries.forEach((geometry) => geometry.dispose());
    material.dispose();

    console.log("✅ Géométries Three.js préchargées");
  } catch (error) {
    console.warn("⚠️ Erreur lors du préchargement Three.js:", error);
  }
};

// Précharger les bibliothèques externes
export const preloadExternalLibraries = async (): Promise<void> => {
  const libraries: ExternalLibrary[] = [
    { name: "Splitting.js", check: () => !!window.Splitting },
    { name: "Lenis", check: () => !!window.Lenis },
    { name: "Three.js", check: () => !!window.THREE },
  ];

  for (const lib of libraries) {
    try {
      await new Promise<void>((resolve) => {
        const checkLibrary = () => {
          if (lib.check()) {
            console.log(`✅ ${lib.name} chargé`);
            resolve();
          } else {
            setTimeout(checkLibrary, 100);
          }
        };
        checkLibrary();
      });
    } catch (error) {
      console.warn(`⚠️ Erreur lors du chargement de ${lib.name}:`, error);
    }
  }
};

// Fonction principale de préchargement
export const preloadEverything = async (): Promise<void> => {
  console.log("🚀 Début du préchargement complet...");

  try {
    await Promise.all([
      preloadCriticalAssets(),
      preloadThreeJSGeometries(),
      preloadExternalLibraries(),
    ]);

    console.log("🎉 Préchargement complet terminé !");
  } catch (error) {
    console.error("❌ Erreur lors du préchargement:", error);
  }
};
