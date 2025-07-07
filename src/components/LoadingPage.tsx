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
      className={`fixed inset-0 z-50 flex items-center justify-center w-screen h-screen transition-all duration-1000 ${
        canHide ? "opacity-0 pointer-events-none" : "opacity-100 bg-black"
      }`}
    >
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        {/* Cercle de progression avec cube 3D au centre */}
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            className="absolute w-full h-full max-w-96 max-h-96 transform -rotate-90"
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
              className="transition-all duration-500 ease-out"
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
