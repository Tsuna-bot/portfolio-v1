import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<"in" | "out">(
    "out"
  );
  const navigate = useNavigate();

  const navigateWithTransition = useCallback(
    (to: string) => {
      setTransitionDirection("out");
      setIsTransitioning(true);

      setTimeout(() => {
        navigate(to);
        setTransitionDirection("in");
        setIsTransitioning(false);
      }, 400);
    },
    [navigate]
  );

  const handleTransitionComplete = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  return {
    isTransitioning,
    transitionDirection,
    navigateWithTransition,
    handleTransitionComplete,
  };
};
