import React, { useEffect, useRef, useState } from "react";
import { usePreloader } from "../hooks/usePreloader";

interface LoadingPageProps {
  onLoadingComplete: () => void;
}

const MIN_DISPLAY_TIME = 1200; // en ms

const LoadingPage: React.FC<LoadingPageProps> = ({ onLoadingComplete }) => {
  const { progress, isLoaded } = usePreloader();
  const [canHide, setCanHide] = useState(false);
  const mountTimeRef = useRef<number>(Date.now());
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoaded) {
      const elapsed = Date.now() - mountTimeRef.current;
      const remaining = Math.max(0, MIN_DISPLAY_TIME - elapsed);
      timeoutRef.current = window.setTimeout(() => {
        setCanHide(true);
        onLoadingComplete();
      }, remaining);
    }
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, [isLoaded, onLoadingComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ${
        canHide ? "opacity-0 pointer-events-none" : "opacity-100 bg-black"
      }`}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Cercle de progression avec cube 3D au centre */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          <svg
            className="absolute w-80 h-80 left-0 top-0 transform -rotate-90"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            {/* Cercle de fond */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 165, 0, 0.1)"
              strokeWidth="1"
            />
            {/* Cercle de progression */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#ff6600"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className="transition-all duration-500 ease-out drop-shadow-lg"
              style={{ filter: "drop-shadow(0 0 10px rgba(255, 102, 0, 0.5))" }}
            />
          </svg>
          {/* Cube 3D orange */}
          <div
            className="cube-container flex items-center justify-center absolute left-1/2 top-1/2"
            style={{
              width: "64px",
              height: "64px",
              transform: "translate(-50%, -50%)",
              perspective: "600px",
            }}
            aria-hidden="true"
          >
            <div className="cube animate-cube-spin">
              <div className="face front" />
              <div className="face back" />
              <div className="face right" />
              <div className="face left" />
              <div className="face top" />
              <div className="face bottom" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
