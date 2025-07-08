import React, { useState } from "react";

interface BurgerMenuProps {
  onBack: () => void;
  onReset: () => void;
  onToggle?: (isOpen: boolean) => void;
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({
  onBack,
  onReset,
  onToggle,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToggle = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    onToggle?.(newState);
  };

  const handleBack = () => {
    setIsMenuOpen(false);
    onToggle?.(false);
    onBack();
  };

  const handleReset = () => {
    setIsMenuOpen(false);
    onToggle?.(false);
    onReset();
  };

  return (
    <>
      {/* Bouton burger */}
      <button
        onClick={handleToggle}
        className="fixed top-4 left-4 z-50 bg-black/80 border border-orange-500 text-orange-400 p-3 rounded-full shadow-lg backdrop-blur-sm touch-manipulation sm:hidden"
        aria-label="Menu"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <div
            className={`w-5 h-0.5 bg-orange-400 transition-all duration-300 ${
              isMenuOpen ? "rotate-45 translate-y-1" : ""
            }`}
          />
          <div
            className={`w-5 h-0.5 bg-orange-400 transition-all duration-300 mt-1 ${
              isMenuOpen ? "opacity-0" : ""
            }`}
          />
          <div
            className={`w-5 h-0.5 bg-orange-400 transition-all duration-300 mt-1 ${
              isMenuOpen ? "-rotate-45 -translate-y-1" : ""
            }`}
          />
        </div>
      </button>

      {/* Menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 sm:hidden">
          <div className="absolute top-16 left-4 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-yellow-500/20 border border-orange-400 text-white px-4 py-3 rounded-xl shadow-2xl backdrop-blur-sm min-w-[200px]">
            {/* Effet holographique de fond */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-yellow-500/10 rounded-xl animate-pulse pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255, 166, 0, 0.2),transparent_50%)] rounded-xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse pointer-events-none"></div>

            <div className="relative z-10 space-y-3">
              <button
                onClick={handleBack}
                className="w-full border border-orange-500 text-orange-400 bg-transparent hover:bg-orange-500 hover:text-white transition-colors px-4 py-3 rounded-full font-bold shadow-lg text-base touch-manipulation"
                aria-label="Retour à l'accueil"
              >
                ← Back
              </button>
              <button
                onClick={handleReset}
                className="w-full bg-orange-500 text-white hover:bg-orange-600 transition-colors border border-orange-500 px-4 py-3 rounded-full font-bold shadow-lg text-base touch-manipulation"
                aria-label="Reset"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BurgerMenu;
