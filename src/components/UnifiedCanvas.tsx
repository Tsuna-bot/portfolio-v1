import React, { useEffect, useState, useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Text3D } from "@react-three/drei";
import * as THREE from "three";
import AnimatedCubes from "./AnimatedCubes";
import logoJN from "../assets/logo-jn.svg";
import ProjectsContainer from "./ProjectsContainer";
import { useLocation } from "react-router-dom";
import Splitting from "splitting";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLocationDot,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import emailjs from "@emailjs/browser";

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

// Hook pour obtenir l'espacement des sections en fonction de la taille d'écran
const useUnitsPerSection = () => {
  const [unitsPerSection, setUnitsPerSection] = React.useState(7);

  React.useEffect(() => {
    const updateUnits = () => {
      const width = window.innerWidth;
      if (width < 640) setUnitsPerSection(12); // Mobile
      else if (width < 1024) setUnitsPerSection(9); // Tablette
      else setUnitsPerSection(7); // Desktop
    };

    updateUnits();
    window.addEventListener("resize", updateUnits);
    return () => window.removeEventListener("resize", updateUnits);
  }, []);

  return unitsPerSection;
};

// Composant pour le contenu 2D d'une section
const SectionContent: React.FC<{
  section: Section;
  index: number;
  isDragging: boolean;
  unitsPerSection: number;
}> = ({ section, index, isDragging, unitsPerSection }) => {
  const x = index * unitsPerSection;
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800
  );
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  // Calcul responsive de l'espace disponible
  const isMobile = viewportWidth < 640;
  const navDotHeight = isMobile ? 80 : 96; // Moins d'espace sur mobile
  const margin = isMobile ? 16 : 24; // Marge réduite sur mobile
  const availableHeight = viewportHeight - navDotHeight - margin;

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Html
      position={[x, 0, 5]}
      center
      style={{
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
      }}
    >
      <div className="w-screen h-screen flex items-center justify-center">
        <div
          className="container mx-auto text-center"
          style={{
            height: "100%",
            maxHeight: availableHeight,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: isMobile ? "0px" : "48px", // Pas de padding sur mobile pour toutes les sections
            paddingBottom: isMobile ? "0px" : "48px", // Pas de padding sur mobile pour toutes les sections
          }}
        >
          <div
            className={
              section.id === "contact"
                ? "w-full flex flex-col justify-center items-center"
                : "max-w-4xl mx-auto flex flex-col justify-center items-center"
            }
            style={{
              pointerEvents: isDragging ? "none" : "auto",
              minHeight: "fit-content",
              maxHeight: availableHeight,
              overflowY:
                isMobile && section.id === "contact" ? "auto" : "hidden",
              margin: "0 auto",
            }}
          >
            {section.content}
          </div>
        </div>
      </div>
    </Html>
  );
};

// Composant pour gérer le scroll et la caméra
const SceneController: React.FC<{
  sections: Section[];
  onDragStateChange: (isDragging: boolean) => void;
  scrollOffset: number;
  fallingActive: boolean;
  onFallingComplete: () => void;
  frontendFallingActive: boolean;
  onFrontendFallingComplete: () => void;
  adobeFallingActive: boolean;
  onAdobeFallingComplete: () => void;
  cmsFallingActive: boolean;
  onCmsFallingComplete: () => void;
  unitsPerSection: number;
}> = ({
  sections,
  onDragStateChange,
  scrollOffset,
  fallingActive,
  onFallingComplete,
  frontendFallingActive,
  onFrontendFallingComplete,
  adobeFallingActive,
  onAdobeFallingComplete,
  cmsFallingActive,
  onCmsFallingComplete,
  unitsPerSection,
}) => {
  const { camera } = useThree();
  const [isDragging, setIsDragging] = useState(false);

  // Animation de la caméra
  useFrame(() => {
    const targetX = scrollOffset;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.1);
  });

  const handleDragStateChange = (isDragging: boolean) => {
    setIsDragging(isDragging);
    onDragStateChange(isDragging);
  };

  const handleFallingComplete = () => {
    onFallingComplete();
  };

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[0, 10, 10]} intensity={0.7} />
      <directionalLight position={[0, -10, 10]} intensity={0.3} />
      <pointLight position={[0, 0, 15]} intensity={0.5} distance={100} />

      {/* Grille technique en arrière-plan */}
      <TechGrid
        sceneWidth={sections.length * unitsPerSection}
        scrollOffset={scrollOffset}
      />

      {/* Sections de contenu */}
      {sections.map((section, index) => (
        <SectionContent
          key={section.id}
          section={section}
          index={index}
          isDragging={isDragging}
          unitsPerSection={unitsPerSection}
        />
      ))}

      {/* Cubes 3D en arrière-plan */}
      <AnimatedCubes
        sceneWidth={sections.length * unitsPerSection}
        onDragStateChange={handleDragStateChange}
      />

      {/* Objets qui tombent */}
      <Suspense fallback={null}>
        <FallingObjects
          isActive={fallingActive}
          onComplete={handleFallingComplete}
          scrollOffset={scrollOffset}
        />
        <FrontendFallingObjects
          isActive={frontendFallingActive}
          onComplete={onFrontendFallingComplete}
          scrollOffset={scrollOffset}
        />
        <AdobeFallingObjects
          isActive={adobeFallingActive}
          onComplete={onAdobeFallingComplete}
          scrollOffset={scrollOffset}
        />
        <CmsFallingObjects
          isActive={cmsFallingActive}
          onComplete={onCmsFallingComplete}
          scrollOffset={scrollOffset}
        />
      </Suspense>
    </>
  );
};

// Composant pour la grille technique orange
const TechGrid: React.FC<{ sceneWidth: number; scrollOffset: number }> = ({
  sceneWidth,
  scrollOffset,
}) => {
  const { camera } = useThree();
  const perspectiveCamera = camera as THREE.PerspectiveCamera;
  const sceneHeight =
    2 *
    Math.tan((perspectiveCamera.fov * Math.PI) / 360) *
    perspectiveCamera.position.z;

  // Ajuster la position de la grille en fonction du scroll
  const gridOffsetX = scrollOffset;

  // Créer une géométrie de grille plus efficace
  const gridSize = 2.0;
  const gridWidth = sceneWidth * 2;
  const gridHeight = sceneHeight * 2;

  // Créer les points pour la grille
  const createGridGeometry = () => {
    const points: number[] = [];

    // Lignes horizontales
    for (let y = -gridHeight / 2; y <= gridHeight / 2; y += gridSize) {
      points.push(-gridWidth / 2, y, 0, gridWidth / 2, y, 0);
    }

    // Lignes verticales
    for (let x = -gridWidth / 2; x <= gridWidth / 2; x += gridSize) {
      points.push(x, -gridHeight / 2, 0, x, gridHeight / 2, 0);
    }

    return new Float32Array(points);
  };

  return (
    <group position={[gridOffsetX, 0, -5]}>
      {/* Fond noir */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[gridWidth, gridHeight]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Grille avec une seule géométrie */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={createGridGeometry().length / 3}
            array={createGridGeometry()}
            itemSize={3}
            args={[createGridGeometry(), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ff6b35" opacity={0.1} transparent />
      </lineSegments>
    </group>
  );
};

// Composant pour une caméra responsive
const ResponsiveCamera: React.FC = () => {
  const { camera, size } = useThree();
  const perspectiveCamera = camera as THREE.PerspectiveCamera;

  useEffect(() => {
    // Calculer le FOV en fonction du ratio d'aspect de l'écran
    const aspectRatio = size.width / size.height;

    // Ajuster le FOV pour maintenir une vue cohérente sur tous les écrans
    if (aspectRatio > 1) {
      // Écran large (desktop)
      perspectiveCamera.fov = 60;
    } else {
      // Écran étroit (mobile)
      perspectiveCamera.fov = 75;
    }

    // Ajuster la position Z de la caméra en fonction de la taille de l'écran
    const baseDistance = 10;
    const scaleFactor = Math.min(size.width, size.height) / 800; // 800px comme référence
    perspectiveCamera.position.z = baseDistance / scaleFactor;

    perspectiveCamera.updateProjectionMatrix();
  }, [size.width, size.height, perspectiveCamera]);

  return null;
};

// Composant pour les dots de navigation
const NavigationDots: React.FC<{
  sections: Section[];
  currentSection: number;
  onSectionChange: (sectionIndex: number) => void;
}> = ({ sections, currentSection, onSectionChange }) => {
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [animatingButton, setAnimatingButton] = useState<string | null>(null);
  const isMobile = viewportWidth < 640;

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrevious = () => {
    if (currentSection > 0 && !animatingButton) {
      setAnimatingButton("prev");
      onSectionChange(currentSection - 1);
      setTimeout(() => setAnimatingButton(null), 300);
    }
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1 && !animatingButton) {
      setAnimatingButton("next");
      onSectionChange(currentSection + 1);
      setTimeout(() => setAnimatingButton(null), 300);
    }
  };

  return (
    <>
      {/* Boutons de navigation fléchés sur mobile */}
      {isMobile && (
        <>
          {/* Bouton gauche */}
          <button
            onClick={handlePrevious}
            disabled={currentSection === 0 || animatingButton !== null}
            className={`fixed bottom-4 left-4 z-50 w-12 h-12 bg-orange-500/30 backdrop-blur-sm rounded-full border border-white/10 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
              animatingButton === "prev" ? "scale-95" : ""
            }`}
            aria-label="Section précédente"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Bouton droit */}
          <button
            onClick={handleNext}
            disabled={
              currentSection === sections.length - 1 || animatingButton !== null
            }
            className={`fixed bottom-4 right-4 z-50 w-12 h-12 bg-orange-500/30 backdrop-blur-sm rounded-full border border-white/10 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
              animatingButton === "next" ? "scale-95" : ""
            }`}
            aria-label="Section suivante"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots de navigation */}
      <div className="fixed bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-50 mt-6">
        <div className="bg-black/20 backdrop-blur-sm rounded-full px-3 sm:px-5 py-2 sm:py-3 border border-white/10 transition-transform duration-300 hover:scale-150">
          <div className="flex space-x-4 sm:space-x-4">
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => onSectionChange(index)}
                className="relative w-3 sm:w-3 h-3 sm:h-3 rounded-full transition-transform duration-300 hover:scale-110 group"
                aria-label={`Aller à la section ${index + 1}`}
              >
                {/* Cercle pulsant pour le dot actif */}
                {index === currentSection && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: "1px solid var(--color-grid)",
                      animation:
                        "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                      transform: "scale(2.5)",
                      zIndex: -1,
                    }}
                  />
                )}

                {/* Cercle central */}
                <div
                  className={`w-full h-full rounded-full transition-all duration-300 ${
                    index === currentSection
                      ? "bg-orange-500"
                      : "hover:bg-orange-400"
                  }`}
                  style={{
                    backgroundColor:
                      index === currentSection
                        ? "var(--color-grid)"
                        : "rgba(255, 122, 26, 0.3)",
                  }}
                />

                {/* Pill avec le titre au survol */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                  <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full whitespace-nowrap border border-white/20">
                    {section.title}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// Composant pour le logo
const Logo: React.FC = () => {
  return (
    <div className="fixed top-4 left-4 md:top-8 md:left-8 z-50">
      <img
        src={logoJN}
        alt="Jeremy Naphay Logo"
        className="h-8 md:h-10 w-auto opacity-80 hover:opacity-100 transition-opacity duration-300"
      />
    </div>
  );
};

// Composant pour les cubes qui tombent
const FallingObjects: React.FC<{
  isActive: boolean;
  onComplete: () => void;
  scrollOffset: number;
}> = ({ isActive, onComplete, scrollOffset }) => {
  const { camera } = useThree();

  const [objects, setObjects] = useState<
    Array<{
      id: number;
      position: [number, number, number];
      velocity: number;
      rotation: [number, number, number];
      rotationSpeed: [number, number, number];
      text: string;
    }>
  >([]);
  const nextIdRef = useRef(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ["Figma", "Wireframe", "Prototype", "Responsive"];

  useEffect(() => {
    if (isActive) {
      // Calculer la position Y responsive basée sur la taille de l'écran
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      const sceneHeight =
        2 *
        Math.tan((perspectiveCamera.fov * Math.PI) / 360) *
        perspectiveCamera.position.z;
      const topPosition = sceneHeight / 2 - 1; // Position en haut du viewport

      // Créer un texte 3D qui tombe du centre
      const newCube = {
        id: nextIdRef.current,
        position: [scrollOffset, topPosition, 2] as [number, number, number], // Du haut du viewport, centré, devant
        velocity: 0.025, // Vitesse de chute
        rotation: [0, 0, 0] as [number, number, number], // Commence droit
        rotationSpeed: [0, 0, 0.002] as [number, number, number], // Rotation légère pendant la chute (pas d'axe Z)
        text: words[currentWordIndex] || "Figma",
      };

      // Passer au mot suivant pour le prochain clic
      setCurrentWordIndex((prev) => (prev + 1) % words.length);

      // Ajouter le cube
      setObjects((prev) => [...prev, newCube]);
      nextIdRef.current += 1;

      // Reset pour le prochain clic
      onComplete();
    }
  }, [isActive, onComplete, camera, scrollOffset]);

  useFrame(() => {
    if (objects.length === 0) return;

    setObjects((prevObjects) => {
      const updatedObjects = prevObjects.map((obj) => ({
        ...obj,
        position: [
          obj.position[0],
          obj.position[1] - obj.velocity,
          obj.position[2],
        ] as [number, number, number],
        rotation: [
          obj.rotation[0] + obj.rotationSpeed[0],
          obj.rotation[1] + obj.rotationSpeed[1],
          obj.rotation[2] + obj.rotationSpeed[2],
        ] as [number, number, number],
      }));

      // Supprimer les objets qui sont sortis de l'écran
      const remainingObjects = updatedObjects.filter(
        (obj) => obj.position[1] > -10
      );

      return remainingObjects;
    });
  });

  if (objects.length === 0) return null;

  return (
    <>
      {objects.map((obj) => (
        <group key={obj.id} position={obj.position} rotation={obj.rotation}>
          {/* Texte 3D "Figma" */}
          <Text3D
            position={[0, 0, 0]}
            size={0.5}
            height={0.2}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
            font="/fonts/helvetiker_regular.typeface.json"
          >
            {obj.text}
            <meshStandardMaterial
              color="#ffa500"
              transparent
              opacity={1}
              metalness={0.3}
              roughness={0.2}
              emissive="#ffa500"
              emissiveIntensity={0.1}
            />
          </Text3D>
        </group>
      ))}
    </>
  );
};

const FrontendFallingObjects: React.FC<{
  isActive: boolean;
  onComplete: () => void;
  scrollOffset: number;
}> = ({ isActive, onComplete, scrollOffset }) => {
  const { camera } = useThree();
  const [objects, setObjects] = useState<
    Array<{
      id: number;
      position: [number, number, number];
      velocity: number;
      rotation: [number, number, number];
      rotationSpeed: [number, number, number];
      text: string;
    }>
  >([]);
  const nextIdRef = useRef(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ["HTML", "CSS", "JavaScript", "ThreeJS", "React"];

  useEffect(() => {
    if (isActive) {
      // Calculer la position Y responsive basée sur la taille de l'écran
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      const sceneHeight =
        2 *
        Math.tan((perspectiveCamera.fov * Math.PI) / 360) *
        perspectiveCamera.position.z;
      const topPosition = sceneHeight / 2 - 1; // Position en haut du viewport

      // Créer un texte 3D qui tombe du centre
      const newCube = {
        id: nextIdRef.current,
        position: [scrollOffset, topPosition, 2] as [number, number, number], // Du haut du viewport, centré, devant
        velocity: 0.025, // Vitesse de chute
        rotation: [0, 0, 0] as [number, number, number], // Commence droit
        rotationSpeed: [0, 0, 0.002] as [number, number, number], // Rotation légère pendant la chute (pas d'axe Z)
        text: words[currentWordIndex] || "HTML",
      };

      // Passer au mot suivant pour le prochain clic
      setCurrentWordIndex((prev) => (prev + 1) % words.length);

      // Ajouter le cube
      setObjects((prev) => [...prev, newCube]);
      nextIdRef.current += 1;

      // Reset pour le prochain clic
      onComplete();
    }
  }, [isActive, onComplete, camera, scrollOffset]);

  useFrame(() => {
    if (objects.length === 0) return;

    setObjects((prevObjects) => {
      const updatedObjects = prevObjects.map((obj) => ({
        ...obj,
        position: [
          obj.position[0],
          obj.position[1] - obj.velocity,
          obj.position[2],
        ] as [number, number, number],
        rotation: [
          obj.rotation[0] + obj.rotationSpeed[0],
          obj.rotation[1] + obj.rotationSpeed[1],
          obj.rotation[2] + obj.rotationSpeed[2],
        ] as [number, number, number],
      }));

      // Supprimer les objets qui sont sortis de l'écran
      const remainingObjects = updatedObjects.filter(
        (obj) => obj.position[1] > -10
      );

      return remainingObjects;
    });
  });

  if (objects.length === 0) return null;

  return (
    <>
      {objects.map((obj) => (
        <group key={obj.id} position={obj.position} rotation={obj.rotation}>
          {/* Texte 3D "Frontend" */}
          <Text3D
            position={[0, 0, 0]}
            size={0.5}
            height={0.2}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
            font="/fonts/helvetiker_regular.typeface.json"
          >
            {obj.text}
            <meshStandardMaterial
              color="#ffa500"
              transparent
              opacity={1}
              metalness={0.3}
              roughness={0.2}
              emissive="#ffa500"
              emissiveIntensity={0.1}
            />
          </Text3D>
        </group>
      ))}
    </>
  );
};

const AdobeFallingObjects: React.FC<{
  isActive: boolean;
  onComplete: () => void;
  scrollOffset: number;
}> = ({ isActive, onComplete, scrollOffset }) => {
  const { camera } = useThree();
  const [objects, setObjects] = useState<
    Array<{
      id: number;
      position: [number, number, number];
      velocity: number;
      rotation: [number, number, number];
      rotationSpeed: [number, number, number];
      text: string;
    }>
  >([]);
  const nextIdRef = useRef(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ["Photoshop", "Illustrator", "After Effects", "Premiere Pro"];

  useEffect(() => {
    if (isActive) {
      // Calculer la position Y responsive basée sur la taille de l'écran
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      const sceneHeight =
        2 *
        Math.tan((perspectiveCamera.fov * Math.PI) / 360) *
        perspectiveCamera.position.z;
      const topPosition = sceneHeight / 2 - 1; // Position en haut du viewport

      // Créer un texte 3D qui tombe du centre
      const newCube = {
        id: nextIdRef.current,
        position: [scrollOffset, topPosition, 2] as [number, number, number], // Du haut du viewport, centré, devant
        velocity: 0.025, // Vitesse de chute
        rotation: [0, 0, 0] as [number, number, number], // Commence droit
        rotationSpeed: [0, 0, 0.002] as [number, number, number], // Rotation légère pendant la chute (pas d'axe Z)
        text: words[currentWordIndex] || "Photoshop",
      };

      // Passer au mot suivant pour le prochain clic
      setCurrentWordIndex((prev) => (prev + 1) % words.length);

      // Ajouter le cube
      setObjects((prev) => [...prev, newCube]);
      nextIdRef.current += 1;

      // Reset pour le prochain clic
      onComplete();
    }
  }, [isActive, onComplete, camera, scrollOffset]);

  useFrame(() => {
    if (objects.length === 0) return;

    setObjects((prevObjects) => {
      const updatedObjects = prevObjects.map((obj) => ({
        ...obj,
        position: [
          obj.position[0],
          obj.position[1] - obj.velocity,
          obj.position[2],
        ] as [number, number, number],
        rotation: [
          obj.rotation[0] + obj.rotationSpeed[0],
          obj.rotation[1] + obj.rotationSpeed[1],
          obj.rotation[2] + obj.rotationSpeed[2],
        ] as [number, number, number],
      }));

      // Supprimer les objets qui sont sortis de l'écran
      const remainingObjects = updatedObjects.filter(
        (obj) => obj.position[1] > -10
      );

      return remainingObjects;
    });
  });

  if (objects.length === 0) return null;

  return (
    <>
      {objects.map((obj) => (
        <group key={obj.id} position={obj.position} rotation={obj.rotation}>
          {/* Texte 3D "Adobe" */}
          <Text3D
            position={[0, 0, 0]}
            size={0.5}
            height={0.2}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
            font="/fonts/helvetiker_regular.typeface.json"
          >
            {obj.text}
            <meshStandardMaterial
              color="#ffa500"
              transparent
              opacity={1}
              metalness={0.3}
              roughness={0.2}
              emissive="#ffa500"
              emissiveIntensity={0.1}
            />
          </Text3D>
        </group>
      ))}
    </>
  );
};

const CmsFallingObjects: React.FC<{
  isActive: boolean;
  onComplete: () => void;
  scrollOffset: number;
}> = ({ isActive, onComplete, scrollOffset }) => {
  const { camera } = useThree();
  const [objects, setObjects] = useState<
    Array<{
      id: number;
      position: [number, number, number];
      velocity: number;
      rotation: [number, number, number];
      rotationSpeed: [number, number, number];
      text: string;
    }>
  >([]);
  const nextIdRef = useRef(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ["Wordpress", "Elementor"];

  useEffect(() => {
    if (isActive) {
      // Calculer la position Y responsive basée sur la taille de l'écran
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      const sceneHeight =
        2 *
        Math.tan((perspectiveCamera.fov * Math.PI) / 360) *
        perspectiveCamera.position.z;
      const topPosition = sceneHeight / 2 - 1; // Position en haut du viewport

      // Créer un texte 3D qui tombe du centre
      const newCube = {
        id: nextIdRef.current,
        position: [scrollOffset, topPosition, 2] as [number, number, number], // Du haut du viewport, centré, devant
        velocity: 0.025, // Vitesse de chute
        rotation: [0, 0, 0] as [number, number, number], // Commence droit
        rotationSpeed: [0, 0, 0.002] as [number, number, number], // Rotation légère pendant la chute (pas d'axe Z)
        text: words[currentWordIndex] || "Wordpress",
      };

      // Passer au mot suivant pour le prochain clic
      setCurrentWordIndex((prev) => (prev + 1) % words.length);

      // Ajouter le cube
      setObjects((prev) => [...prev, newCube]);
      nextIdRef.current += 1;

      // Reset pour le prochain clic
      onComplete();
    }
  }, [isActive, onComplete, camera, scrollOffset]);

  useFrame(() => {
    if (objects.length === 0) return;

    setObjects((prevObjects) => {
      const updatedObjects = prevObjects.map((obj) => ({
        ...obj,
        position: [
          obj.position[0],
          obj.position[1] - obj.velocity,
          obj.position[2],
        ] as [number, number, number],
        rotation: [
          obj.rotation[0] + obj.rotationSpeed[0],
          obj.rotation[1] + obj.rotationSpeed[1],
          obj.rotation[2] + obj.rotationSpeed[2],
        ] as [number, number, number],
      }));

      // Supprimer les objets qui sont sortis de l'écran
      const remainingObjects = updatedObjects.filter(
        (obj) => obj.position[1] > -10
      );

      return remainingObjects;
    });
  });

  if (objects.length === 0) return null;

  return (
    <>
      {objects.map((obj) => (
        <group key={obj.id} position={obj.position} rotation={obj.rotation}>
          {/* Texte 3D "CMS" */}
          <Text3D
            position={[0, 0, 0]}
            size={0.5}
            height={0.2}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={5}
            font="/fonts/helvetiker_regular.typeface.json"
          >
            {obj.text}
            <meshStandardMaterial
              color="#ffa500"
              transparent
              opacity={1}
              metalness={0.3}
              roughness={0.2}
              emissive="#ffa500"
              emissiveIntensity={0.1}
            />
          </Text3D>
        </group>
      ))}
    </>
  );
};

interface UnifiedCanvasProps {
  heroTitlesShouldAnimate: boolean;
  showLoading: boolean;
}

const UnifiedCanvas: React.FC<UnifiedCanvasProps> = ({
  heroTitlesShouldAnimate,
  showLoading,
}) => {
  const location = useLocation();
  const unitsPerSection = useUnitsPerSection();
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [targetScrollOffset, setTargetScrollOffset] = useState(0);
  const [fallingActive, setFallingActive] = useState(false);
  const [frontendFallingActive, setFrontendFallingActive] = useState(false);
  const [adobeFallingActive, setAdobeFallingActive] = useState(false);
  const [cmsFallingActive, setCmsFallingActive] = useState(false);
  const [hasScrolledToProjects, setHasScrolledToProjects] = useState(false);
  const [hasPlayedHeroAnimation, setHasPlayedHeroAnimation] = useState(false);
  const animationStartedRef = useRef(false);
  const hasEverPlayedRef = useRef(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Variables pour le swipe mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(
    null
  );

  const handleDragStateChange = (isDragging: boolean) => {
    setIsDragging(isDragging);
  };

  const handleUxDesignClick = () => {
    setFallingActive(true);
  };

  const handleFrontendClick = () => {
    setFrontendFallingActive(true);
  };

  const handleAdobeClick = () => {
    setAdobeFallingActive(true);
  };

  const handleCmsClick = () => {
    setCmsFallingActive(true);
  };

  // Fonction de gestion des changements de champs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Fonction d'envoi du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      await emailjs.send(
        "service_o6nr9h1", // Service ID
        "template_4983pdh", // Template ID
        {
          name: form.name,
          email: form.email,
          title: form.title,
          message: form.message,
        },
        "qR9NeFT3eXBTLkJ4s" // Public Key
      );
      setFeedback({ type: "success", message: "Message sent successfully!" });
      setForm({ name: "", email: "", title: "", message: "" });
    } catch {
      setFeedback({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Déclaration du contenu About ici pour accès au handler
  const aboutSection = (
    <>
      {/* Version mobile */}
      <div className="block lg:hidden w-full max-w-2xl mx-auto px-2 flex flex-col justify-center items-center min-h-screen">
        {/* Titre */}
        <div className="text-center mb-3">
          <div className="text-xl font-bold text-white mb-2 font-heading">
            About
          </div>
          <div
            className="w-12 h-0.5 mx-auto"
            style={{ backgroundColor: "var(--color-grid)" }}
          ></div>
        </div>
        {/* Contenu principal */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white mb-2 font-heading text-center">
            Passionate Creative Dev UI
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed font-body text-center">
            Hi ! I'm Jérémy NAPHAY, a french Creative Developer based in Lyon,
            France. I blend technology, design, and storytelling to craft bold,
            immersive web experiences.
          </p>
          <p className="text-sm text-gray-300 leading-relaxed font-body text-center">
            With a strong foundation in UI/UX design and a sharp eye for
            interaction, I specialize in building dynamic websites that feel
            like living worlds. As a UI Designer and Front-end Developer, I
            create engaging digital experiences.
          </p>
          {/* Boutons en grille 2x2 */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              className="w-full px-3 py-2 rounded-lg shadow-lg border-2 transition-all duration-300 cursor-pointer about-ux-btn text-xs font-bold"
              style={{
                backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                borderColor: "var(--color-grid)",
                color: "var(--color-grid)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(var(--color-grid-rgb), 0.2)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(var(--color-grid-rgb), 0.1)";
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={handleUxDesignClick}
            >
              <span className="font-bold">UI/UX Design</span>
            </button>
            <button
              className="w-full px-3 py-2 rounded-lg shadow-lg border-2 transition-all duration-300 cursor-pointer text-xs font-bold"
              style={{
                backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                borderColor: "var(--color-grid)",
                color: "var(--color-grid)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(var(--color-grid-rgb), 0.2)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(var(--color-grid-rgb), 0.1)";
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={handleFrontendClick}
            >
              <span className="font-bold">Front-end</span>
            </button>
            <button
              className="w-full px-3 py-2 rounded-lg shadow-lg border-2 transition-all duration-300 cursor-pointer text-xs font-bold"
              style={{
                backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                borderColor: "var(--color-grid)",
                color: "var(--color-grid)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(var(--color-grid-rgb), 0.2)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(var(--color-grid-rgb), 0.1)";
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={handleAdobeClick}
            >
              <span className="font-bold">Adobe Suite</span>
            </button>
            <button
              className="w-full px-3 py-2 rounded-lg shadow-lg border-2 transition-all duration-300 cursor-pointer text-xs font-bold"
              style={{
                backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                borderColor: "var(--color-grid)",
                color: "var(--color-grid)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(var(--color-grid-rgb), 0.2)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(var(--color-grid-rgb), 0.1)";
                e.currentTarget.style.transform = "scale(1)";
              }}
              onClick={handleCmsClick}
            >
              <span className="font-bold">CMS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Version desktop */}
      <div className="hidden lg:block">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-heading">
            About
          </div>
          <div
            className="w-24 h-1 mx-auto"
            style={{ backgroundColor: "var(--color-grid)" }}
          ></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 font-heading">
              Passionate Creative Dev UI
            </h3>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-body">
              Hi ! I'm Jérémy NAPHAY, a french Creative Developer based in Lyon,
              France. I blend technology, design, and storytelling to craft
              bold, immersive web experiences that captivate users and drive
              engagement.
            </p>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-body">
              With a strong foundation in UI/UX design and a sharp eye for
              interaction, I specialize in building dynamic websites that feel
              like living worlds. As a UI Designer and Front-end Developer, I
              create engaging digital experiences for clients across France and
              Europe, focusing on modern design principles and cutting-edge web
              technologies.
            </p>
            <div className="grid grid-cols-2 sm:flex sm:flex-row flex-wrap gap-2 sm:gap-4 justify-center">
              <button
                className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full shadow-lg border-2 transition-all duration-300 cursor-pointer about-ux-btn text-sm sm:text-base md:text-lg font-bold"
                style={{
                  backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                  borderColor: "var(--color-grid)",
                  color: "var(--color-grid)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(var(--color-grid-rgb), 0.2)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(var(--color-grid-rgb), 0.1)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onClick={handleUxDesignClick}
              >
                <span className="font-bold">UI/UX Design</span>
              </button>
              <button
                className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full shadow-lg border-2 transition-all duration-300 cursor-pointer text-sm sm:text-base md:text-lg font-bold"
                style={{
                  backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                  borderColor: "var(--color-grid)",
                  color: "var(--color-grid)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(var(--color-grid-rgb), 0.2)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(var(--color-grid-rgb), 0.1)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onClick={handleFrontendClick}
              >
                <span className="font-bold">Front-end</span>
              </button>
              <button
                className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full shadow-lg border-2 transition-all duration-300 cursor-pointer text-sm sm:text-base md:text-lg font-bold"
                style={{
                  backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                  borderColor: "var(--color-grid)",
                  color: "var(--color-grid)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(var(--color-grid-rgb), 0.2)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(var(--color-grid-rgb), 0.1)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onClick={handleAdobeClick}
              >
                <span className="font-bold">Adobe Suite</span>
              </button>
              <button
                className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full shadow-lg border-2 transition-all duration-300 cursor-pointer text-sm sm:text-base md:text-lg font-bold"
                style={{
                  backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                  borderColor: "var(--color-grid)",
                  color: "var(--color-grid)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(var(--color-grid-rgb), 0.2)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(var(--color-grid-rgb), 0.1)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
                onClick={handleCmsClick}
              >
                <span className="font-bold">CMS</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Déclaration du tableau sections ici
  const sections: Section[] = [
    {
      id: "home",
      title: "Home",
      content: (
        <>
          <div className="hero-title-container">
            <div className="hero-title-line">
              <h1
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 font-body hero-title"
                data-splitting="words"
                style={{
                  color: "var(--color-grid)",
                  opacity: 0,
                  visibility: "hidden",
                }}
              >
                JEREMY NAPHAY
              </h1>
            </div>
            <div className="hero-title-line">
              <h2
                className="text-4xl sm:text-4xl md:text-6xl lg:text-8xl text-gray-300 font-heading hero-title"
                data-splitting="words"
                style={{ opacity: 0, fontFamily: "shuttleblock, sans-serif" }}
              >
                <div
                  className="text-center font-heading"
                  style={{ fontFamily: "shuttleblock, sans-serif" }}
                >
                  <div
                    className="font-black"
                    style={{ fontFamily: "shuttleblock, sans-serif" }}
                  >
                    UI DESIGNER
                  </div>
                </div>
              </h2>
            </div>
            <div className="hero-title-line">
              <h2
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-300 my-2 font-heading hero-title"
                data-splitting="words"
                style={{ opacity: 0, fontFamily: "shuttleblock, sans-serif" }}
              >
                <div
                  className="text-center font-heading"
                  style={{ fontFamily: "shuttleblock, sans-serif" }}
                >
                  <div style={{ fontFamily: "shuttleblock, sans-serif" }}>
                    &
                  </div>
                </div>
              </h2>
            </div>
            <div className="hero-title-line">
              <h2
                className="text-4xl md:text-8xl text-gray-300 mb-8 font-heading hero-title"
                data-splitting="words"
                style={{ opacity: 0, fontFamily: "shuttleblock, sans-serif" }}
              >
                <div
                  className="text-center font-heading"
                  style={{ fontFamily: "shuttleblock, sans-serif" }}
                >
                  <div
                    className="font-black"
                    style={{ fontFamily: "shuttleblock, sans-serif" }}
                  >
                    CREATIVE DEV
                  </div>
                </div>
              </h2>
            </div>
            <div className="hero-title-line">
              <p
                className="text-4xl md:text-7xl text-gray-400 mb-1.5 max-w-2xl mx-auto leading-relaxed font-body hero-title"
                data-splitting="words"
                style={{ color: "var(--color-grid)", opacity: 0 }}
              >
                Making cool-ish stuff
              </p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: "about",
      title: "About",
      content: aboutSection,
    },
    {
      id: "projects",
      title: "Projects",
      content: <ProjectsContainer />,
    },
    {
      id: "contact",
      title: "Contact",
      content: (
        <>
          {/* Version mobile */}
          <div className="block lg:hidden w-full max-w-2xl mx-auto px-2">
            {/* Titre */}
            <div className="text-center mb-4">
              <div className="text-xl font-bold text-white mb-2 font-heading">
                Contact
              </div>
              <div
                className="w-12 h-0.5 mx-auto"
                style={{ backgroundColor: "var(--color-grid)" }}
              ></div>
            </div>
            {/* Texte d'intro */}
            <div className="text-sm text-gray-300 leading-relaxed font-body text-center mb-6">
              Ready to bring your ideas to life ?
            </div>
            {/* Formulaire de contact */}
            <div className="mb-6">
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="group">
                    <label className="block text-white font-medium mb-1 font-body text-xs">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all duration-300 font-body text-sm"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-white font-medium mb-1 font-body text-xs">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all duration-300 font-body text-sm"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-white font-medium mb-1 font-body text-xs">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all duration-300 font-body text-sm"
                    placeholder="Subject of your message"
                    required
                  />
                </div>
                <div className="group">
                  <label className="block text-white font-medium mb-1 font-body text-xs">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all duration-300 resize-none font-body text-sm"
                    placeholder="Your message..."
                    required
                  ></textarea>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 rounded-lg font-bold text-base border-2 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 font-body"
                    style={{
                      backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                      borderColor: "var(--color-grid)",
                      color: "var(--color-grid)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(var(--color-grid-rgb), 0.2)";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(var(--color-grid-rgb), 0.1)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                  {feedback && (
                    <div
                      className={`text-center mt-2 text-xs ${
                        feedback.type === "success"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {feedback.message}
                    </div>
                  )}
                </div>
              </form>
            </div>
            {/* Grille unifiée : Connect With Me + Location + Available */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/j%C3%A9r%C3%A9my-naphay/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center p-1.5 rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 group-hover:scale-105 min-w-0 w-full h-12"
                aria-label="LinkedIn"
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                  style={{
                    backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faLinkedinIn}
                    className="text-sm text-white group-hover:text-orange-400 transition-colors"
                    aria-hidden="true"
                  />
                </div>
              </a>
              {/* Email */}
              <a
                href="mailto:jeremynaphay@gmail.com"
                className="group flex items-center justify-center p-1.5 rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 group-hover:scale-105 min-w-0 w-full h-12"
                aria-label="Email"
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                  style={{
                    backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-sm text-white group-hover:text-orange-400 transition-colors"
                    aria-hidden="true"
                  />
                </div>
              </a>
              {/* Location */}
              <div className="group flex items-center justify-center p-1.5 rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/50 w-full h-12">
                <span className="text-gray-400 text-xs font-body text-center">
                  Lyon
                </span>
              </div>
              {/* Available for */}
              <div className="group flex items-center justify-center p-1.5 rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/50 w-full h-12">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="text-green-400 text-xs font-medium">
                    Free
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Version desktop (restaurée) */}
          <div className="hidden lg:block">
            <div className="text-center mb-12">
              <div className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
                Contact
              </div>
              <div
                className="w-24 h-1 mx-auto"
                style={{ backgroundColor: "var(--color-grid)" }}
              ></div>
            </div>
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-8 gap-x-0 lg:gap-x-32 items-start">
                {/* Colonne gauche : texte + infos + social */}
                <div className="space-y-8 lg:space-y-0 lg:h-full lg:flex lg:flex-col lg:justify-between">
                  <div className="space-y-6">
                    <h3 className="text-3xl font-bold text-white mb-8 font-heading">
                      Let's create something
                      <span
                        className="block"
                        style={{ color: "var(--color-grid)" }}
                      >
                        amazing together
                      </span>
                    </h3>
                    <p className="text-lg text-gray-300 leading-relaxed font-body">
                      Ready to bring your ideas to life ? I'm always excited to
                      work on new projects and collaborate with creative minds.
                    </p>
                  </div>
                  {/* Social Links */}
                  <div className="pt-8">
                    <h4 className="text-lg font-semibold text-white mb-4 font-heading text-left">
                      Connect With Me
                    </h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {/* LinkedIn */}
                      <a
                        href="https://www.linkedin.com/in/j%C3%A9r%C3%A9my-naphay/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 group-hover:scale-105"
                      >
                        <div
                          className="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                          style={{
                            backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faLinkedinIn}
                            className="text-lg text-white group-hover:text-orange-400 transition-colors"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-white font-medium text-sm font-body text-left">
                            LinkedIn
                          </p>
                          <p className="text-gray-400 text-xs font-body text-left">
                            @jeremynaphay
                          </p>
                        </div>
                      </a>
                      {/* Email */}
                      <a
                        href="mailto:jeremynaphay@gmail.com"
                        className="group flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 group-hover:scale-105"
                      >
                        <div
                          className="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                          style={{
                            backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faEnvelope}
                            className="text-lg text-white group-hover:text-orange-400 transition-colors"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-white font-medium text-sm font-body text-left">
                            Email
                          </p>
                          <p className="text-gray-400 text-xs font-body text-left">
                            jeremynaphay@gmail.com
                          </p>
                        </div>
                      </a>
                    </div>
                  </div>
                  {/* Location & Available for */}
                  <div className="space-y-6 lg:space-y-0 pt-8 lg:pt-0 lg:grid lg:[grid-template-columns:1fr_2fr] lg:gap-6 lg:items-stretch">
                    {/* Location */}
                    <div className="group flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/50 w-full h-full">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                        style={{
                          backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faLocationDot}
                          className="text-lg text-white group-hover:text-orange-400 transition-colors"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-medium text-sm font-body text-left">
                          Location
                        </p>
                        <p className="text-gray-400 text-xs font-body text-left">
                          Lyon, France
                        </p>
                      </div>
                    </div>
                    {/* Available for */}
                    <div className="group flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-700/50 w-full h-full">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                        style={{
                          backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faBriefcase}
                          className="text-lg text-white group-hover:text-orange-400 transition-colors"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm font-body text-left">
                          Available for
                        </p>
                        <p className="text-gray-400 text-xs font-body text-left">
                          Freelance & Full-time
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-0 lg:ml-auto">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-green-400 text-xs font-medium">
                          Available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Colonne droite : formulaire */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 font-heading">
                      Send me a
                      <span
                        className="block"
                        style={{ color: "var(--color-grid)" }}
                      >
                        message
                      </span>
                    </h3>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="group">
                          <label className="block text-white font-medium mb-2 font-body">
                            Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 font-body"
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div className="group">
                          <label className="block text-white font-medium mb-2 font-body">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 font-body"
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="block text-white font-medium mb-2 font-body">
                          Subject
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={form.title}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 font-body"
                          placeholder="Subject of your message"
                          required
                        />
                      </div>
                      <div className="group">
                        <label className="block text-white font-medium mb-2 font-body">
                          Message
                        </label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleInputChange}
                          rows={5}
                          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 resize-none font-body"
                          placeholder="Your message..."
                          required
                        ></textarea>
                      </div>
                      <div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full px-6 py-3 rounded-lg font-bold text-base border-2 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 font-body"
                          style={{
                            backgroundColor: "rgba(var(--color-grid-rgb), 0.1)",
                            borderColor: "var(--color-grid)",
                            color: "var(--color-grid)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "rgba(var(--color-grid-rgb), 0.2)";
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "rgba(var(--color-grid-rgb), 0.1)";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          {loading ? "Sending..." : "Send Message"}
                        </button>
                        {feedback && (
                          <div
                            className={`text-center mt-4 ${
                              feedback.type === "success"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {feedback.message}
                          </div>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ),
    },
  ];

  // Empêche la transition de se rejouer lors du retour sur Projects
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sectionParam = urlParams.get("section");

    if (sectionParam === "projects" && !hasScrolledToProjects) {
      setHasScrolledToProjects(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (sectionParam !== "projects" && hasScrolledToProjects) {
      setHasScrolledToProjects(false);
    }
  }, [location.search, hasScrolledToProjects]);

  // Effet dédié au scroll automatique vers Projects sans transition
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sectionParam = urlParams.get("section");
    if (sectionParam === "projects") {
      const sectionIndex = sections.findIndex(
        (section) => section.id === "projects"
      );
      if (sectionIndex !== -1) {
        const newTargetOffset = sectionIndex * unitsPerSection;
        setTargetScrollOffset(newTargetOffset);
        setScrollOffset(newTargetOffset);
        setCurrentSection(sectionIndex);
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.search]);

  // Calculer la section actuelle basée sur le scroll
  useEffect(() => {
    const sectionIndex = Math.round(scrollOffset / unitsPerSection);
    setCurrentSection(Math.max(0, Math.min(sectionIndex, sections.length - 1)));
  }, [scrollOffset]);

  // Animation fluide du scroll vers la cible
  useEffect(() => {
    const animateScroll = () => {
      if (Math.abs(scrollOffset - targetScrollOffset) > 0.01) {
        setScrollOffset((prev) => prev + (targetScrollOffset - prev) * 0.1);
        requestAnimationFrame(animateScroll);
      } else {
        setScrollOffset(targetScrollOffset);
      }
    };

    if (scrollOffset !== targetScrollOffset) {
      animateScroll();
    }
  }, [targetScrollOffset, scrollOffset]);

  // Animation des titres hero déclenchée explicitement après la loading page
  useEffect(() => {
    if (
      heroTitlesShouldAnimate &&
      !hasPlayedHeroAnimation &&
      !animationStartedRef.current &&
      !hasEverPlayedRef.current &&
      !showLoading // Attendre que la loading page soit terminée
    ) {
      animationStartedRef.current = true;
      hasEverPlayedRef.current = true;

      let attempts = 0;
      const maxAttempts = 40; // 2 secondes max
      const trySplitting = () => {
        const titleElements = document.querySelectorAll(".hero-title");
        if (titleElements.length > 0) {
          // Vérifier si l'animation a déjà été appliquée
          const hasAnimatedWords = Array.from(titleElements).some(
            (titleEl) => titleEl.querySelectorAll(".word.animate").length > 0
          );

          if (hasAnimatedWords) {
            setHasPlayedHeroAnimation(true);
            return;
          }

          titleElements.forEach((titleEl, idx) => {
            // Nettoyer les anciens spans .word
            const beforeCleanWords = titleEl.querySelectorAll(".word");
            beforeCleanWords.forEach((el) => el.replaceWith(...el.childNodes));

            // S'assurer que le titre est invisible avant l'animation
            (titleEl as HTMLElement).style.opacity = "0";
            (titleEl as HTMLElement).style.visibility = "hidden";

            // Créer les mots avec Splitting.js
            const results = Splitting({ target: titleEl, by: "words" });

            if (results[0] && results[0].words && results[0].words.length > 0) {
              // Attendre un peu que Splitting.js finisse de créer les mots
              setTimeout(() => {
                // S'assurer que tous les mots sont invisibles
                results[0]?.words?.forEach((wordElement) => {
                  (wordElement as HTMLElement).style.opacity = "0";
                  (wordElement as HTMLElement).style.setProperty(
                    "opacity",
                    "0",
                    "important"
                  );
                  (wordElement as HTMLElement).classList.remove("animate");

                  // Forcer la police shuttleblock seulement sur UI DESIGNER et CREATIVE DEV (index 1 et 3)
                  if (idx === 1 || idx === 3) {
                    (wordElement as HTMLElement).style.fontFamily =
                      "shuttleblock, sans-serif";
                  }
                });

                // Rendre le conteneur visible
                (titleEl as HTMLElement).style.opacity = "1";
                (titleEl as HTMLElement).style.visibility = "visible";
                (titleEl as HTMLElement).style.setProperty(
                  "opacity",
                  "1",
                  "important"
                );
                (titleEl as HTMLElement).classList.add("animate");

                // Animer les mots un par un avec un délai plus long
                results[0]?.words?.forEach((wordElement, i) => {
                  setTimeout(() => {
                    (wordElement as HTMLElement).classList.add("animate");
                    (wordElement as HTMLElement).style.opacity = "1";
                    (wordElement as HTMLElement).style.setProperty(
                      "opacity",
                      "1",
                      "important"
                    );
                  }, i * 200); // Délai plus long entre chaque mot (200ms au lieu de 150ms)
                });
              }, 100); // Petit délai pour s'assurer que Splitting.js a fini
            } else {
              // Si Splitting n'a pas fonctionné, garder le titre invisible
              (titleEl as HTMLElement).style.opacity = "0";
            }
          });
          setTimeout(() => {
            setHasPlayedHeroAnimation(true);
          }, 4 * 200 + 10 * 150 + 1200); // Délai pour toutes les lignes + tous les mots + délai final
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(trySplitting, 50);
        } else {
          setHasPlayedHeroAnimation(true);
        }
      };
      trySplitting();
    }
  }, [heroTitlesShouldAnimate, hasPlayedHeroAnimation, showLoading]);

  // Garder les titres visibles après l'animation
  useEffect(() => {
    if (hasPlayedHeroAnimation) {
      const titleElements = document.querySelectorAll(".hero-title");
      titleElements.forEach((titleEl) => {
        const titleElement = titleEl as HTMLElement;
        titleElement.style.opacity = "1";
      });
    }
  }, [hasPlayedHeroAnimation]);

  // Gestion du scroll horizontal
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isDragging) {
        e.preventDefault();
        return;
      }

      const delta = e.deltaX || e.deltaY;
      const newOffset = Math.max(
        0,
        Math.min(
          scrollOffset + delta * 0.01,
          (sections.length - 1) * unitsPerSection
        )
      );
      setScrollOffset(newOffset);
      setTargetScrollOffset(newOffset); // Synchroniser la cible avec le scroll manuel
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [scrollOffset, isDragging]);

  // Fonction pour naviguer vers une section spécifique
  const handleSectionChange = (sectionIndex: number) => {
    const newTargetOffset = sectionIndex * unitsPerSection;
    setTargetScrollOffset(newTargetOffset);
  };

  // Gestionnaires pour le swipe mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.targetTouches[0]) {
      setTouchStart({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.targetTouches[0]) {
      setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      });
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    // Seuil minimum pour considérer un swipe (50px)
    if (isHorizontalSwipe && Math.abs(distanceX) > 50) {
      const currentSectionIndex = Math.round(scrollOffset / unitsPerSection);
      let newSectionIndex = currentSectionIndex;

      if (distanceX > 0) {
        // Swipe vers la gauche (section suivante)
        newSectionIndex = Math.min(
          currentSectionIndex + 1,
          sections.length - 1
        );
      } else {
        // Swipe vers la droite (section précédente)
        newSectionIndex = Math.max(currentSectionIndex - 1, 0);
      }

      const newTargetOffset = newSectionIndex * unitsPerSection;
      setTargetScrollOffset(newTargetOffset);
    }

    // Reset des positions
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      className="w-screen h-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "auto",
        }}
      >
        <ResponsiveCamera />
        <SceneController
          sections={sections}
          onDragStateChange={handleDragStateChange}
          scrollOffset={scrollOffset}
          fallingActive={fallingActive}
          onFallingComplete={() => setFallingActive(false)}
          frontendFallingActive={frontendFallingActive}
          onFrontendFallingComplete={() => setFrontendFallingActive(false)}
          adobeFallingActive={adobeFallingActive}
          onAdobeFallingComplete={() => setAdobeFallingActive(false)}
          cmsFallingActive={cmsFallingActive}
          onCmsFallingComplete={() => setCmsFallingActive(false)}
          unitsPerSection={unitsPerSection}
        />
      </Canvas>

      {/* Dots de navigation */}
      <NavigationDots
        sections={sections}
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
      />

      {/* Logo */}
      <Logo />

      {/* Injection du handler dans le bouton UI/UX Design de la section About */}
      {currentSection === 1 && (
        <style>{`
          .about-ux-btn { cursor: pointer; }
        `}</style>
      )}

      {/* Feedback message */}
      {feedback && (
        <div
          className={`text-center mt-4 ${
            feedback.type === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default UnifiedCanvas;
