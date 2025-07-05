import { useEffect, useState } from "react";

// Liste des images à précharger (chemins relatifs)
const imagePaths = [
  "/src/assets/logo-jn.svg",
  "/src/assets/projects/logo-trekks.svg",
  "/src/assets/projects/logo-workly.svg",
];

// Liste des polices à précharger
const fontSpecs = ['1em "helvetica-lt-pro"', '1em "shuttleblock"'];

// Liste des JSON à précharger
const jsonPaths = ["/fonts/helvetiker_regular.typeface.json"];

const loadImage = (src: string) => {
  return new Promise<void>((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
};

const loadFont = (spec: string) => {
  return document.fonts && document.fonts.load
    ? document.fonts.load(spec)
    : Promise.resolve();
};

const loadJSON = (url: string) => {
  return fetch(url)
    .then((res) => res.json())
    .catch(() => undefined);
};

export const usePreloader = () => {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let loaded = 0;
    const total = imagePaths.length + fontSpecs.length + jsonPaths.length;
    if (total === 0) {
      setProgress(100);
      setIsLoaded(true);
      return;
    }

    const updateProgress = () => {
      loaded++;
      setProgress(Math.round((loaded / total) * 100));
    };

    const promises: Promise<unknown>[] = [];
    imagePaths.forEach((src) => {
      promises.push(loadImage(src).then(updateProgress));
    });
    fontSpecs.forEach((spec) => {
      promises.push(loadFont(spec).then(updateProgress));
    });
    jsonPaths.forEach((url) => {
      promises.push(loadJSON(url).then(updateProgress));
    });

    Promise.all(promises).then(() => {
      setProgress(100);
      setIsLoaded(true);
    });
  }, []);

  return { progress, isLoaded };
};
