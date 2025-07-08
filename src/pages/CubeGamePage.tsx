import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import type { Mesh } from "three";
import { Physics, RigidBody } from "@react-three/rapier";
import BurgerMenu from "../components/BurgerMenu";

const HOLO_COL = "#ffef36";

// Composant AimCurve (courbe de visée correspondant à la vraie physique)
const AimCurve = ({ angle, power }: { angle: number; power: number }) => {
  const meshRef = useRef<Mesh>(null);

  // Calcul basé sur la vraie physique du jeu
  const THROW_SPEED = 10;
  const speed = THROW_SPEED * power;
  const vx = Math.sin(angle) * speed;
  const vz = Math.cos(angle) * speed;
  const vy = (power - 1) * 8.0;

  const start = new THREE.Vector3().set(0, 1.2, 4);

  // Point intermédiaire (après 0.3 secondes)
  const t1 = 0.3;
  const midX = vx * t1;
  const midY = 1.2 + vy * t1 - 0.5 * 9.81 * t1 * t1; // Physique avec gravité
  const midZ = 4 + vz * t1;
  const mid = new THREE.Vector3().set(midX, midY, midZ);

  // Point final (après 0.6 secondes)
  const t2 = 0.6;
  const endX = vx * t2;
  const endY = 1.2 + vy * t2 - 0.5 * 9.81 * t2 * t2; // Physique avec gravité
  const endZ = 4 + vz * t2;
  const end = new THREE.Vector3().set(endX, endY, endZ);

  // Courbe basée sur la vraie physique
  const curve = new THREE.CatmullRomCurve3([start, mid, end]);

  useFrame(({ clock }) => {
    if (meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
      if ("emissiveIntensity" in mat) {
        mat.emissiveIntensity =
          1.5 + Math.sin(clock.getElapsedTime() * 3) * 0.6;
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[curve, 64, 0.015, 8, false]} />
      <meshPhysicalMaterial
        color="#ff6b00"
        emissive="#ff6b00"
        opacity={0.7}
        transparent
        transmission={0.9}
        ior={1.3}
        metalness={1}
        roughness={0.05}
        clearcoat={1}
        clearcoatRoughness={0.02}
        thickness={0.3}
        emissiveIntensity={1.5}
      />
    </mesh>
  );
};

const INITIAL_CUBE_POS: [number, number, number] = [0, 1.2, 4];
const THROW_SPEED = 10;

const Scene = ({ onTargetHit }: { onTargetHit: () => void }) => {
  const { camera } = useThree();
  const [isAiming, setIsAiming] = useState(false);
  const [aimAngle, setAimAngle] = useState(0); // 0 = tout droit
  const [power, setPower] = useState(1);
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [projectiles, setProjectiles] = useState<
    Array<{
      id: number;
      start: [number, number, number];
      velocity: [number, number, number];
      onGround: boolean;
    }>
  >([]);
  const [targets, setTargets] = useState<
    Array<{
      id: number;
      position: [number, number, number];
      isActive: boolean;
      rotation: [number, number, number];
    }>
  >([
    {
      id: 1,
      position: [0, 2.5, 12],
      isActive: true,
      rotation: [Math.PI / 2, 0, 0],
    },
  ]);
  const nextTargetId = useRef(2);
  const nextId = useRef(0);
  const cubeRef = useRef<Mesh>(null);

  useFrame(() => {
    const target = new THREE.Vector3().set(0, 2, 2);
    camera.position.lerp(target, 0.08);
    camera.lookAt(0, 1, 26);
    if (cubeRef.current) cubeRef.current.position.set(...INITIAL_CUBE_POS);
  });

  // Gestion automatique de la suppression des cubes au sol
  useEffect(() => {
    const onGroundProjectiles = projectiles.filter((p) => p.onGround);
    if (onGroundProjectiles.length > 10) {
      // Supprime les plus anciens (garder max 10 au sol)
      const toRemove = onGroundProjectiles.slice(
        0,
        onGroundProjectiles.length - 10
      );
      setProjectiles((prev) => prev.filter((p) => !toRemove.includes(p)));
    }
  }, [projectiles]);

  // Gestion automatique de la suppression des cibles au sol
  useEffect(() => {
    const onGroundTargets = targets.filter((t) => !t.isActive);
    if (onGroundTargets.length > 2) {
      // Supprime les plus anciens (garder max 2 au sol)
      const toRemove = onGroundTargets.slice(0, onGroundTargets.length - 2);
      setTargets((prev) => prev.filter((t) => !toRemove.includes(t)));
    }
  }, [targets]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsAiming(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setPower(1);
  };

  useEffect(() => {
    if (!isAiming) return;
    const handleGlobalPointerMove = (e: PointerEvent) => {
      if (startX === null || startY === null) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      // Angle (horizontal)
      const deltaX = clientX - startX;
      let angle = (deltaX / 200) * (Math.PI / 4); // max +/- 45°
      angle = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, angle));
      setAimAngle(angle);
      // Puissance (vertical)
      const deltaY = clientY - startY;
      let pow = 1 + deltaY / 100; // Plus sensible (180 → 100) pour un contrôle plus fin
      pow = Math.max(0.3, Math.min(2.0, pow)); // Limites étendues (0.5-1.5 → 0.3-2.0) pour plus de variété
      setPower(pow);
    };
    window.addEventListener("pointermove", handleGlobalPointerMove);
    return () =>
      window.removeEventListener("pointermove", handleGlobalPointerMove);
  }, [isAiming, startX, startY]);

  useEffect(() => {
    if (!isAiming) return;
    const handleGlobalPointerUp = () => {
      // Au tir, ajoute un nouveau projectile dynamique
      const speed = THROW_SPEED * power;
      const vx = Math.sin(aimAngle) * speed;
      const vz = Math.cos(aimAngle) * speed;
      const vy = (power - 1) * 8.0; // Augmenté de 2.0 à 8.0 pour plus de hauteur avec THROW_SPEED = 10

      setProjectiles((prev) => [
        ...prev,
        {
          id: nextId.current++,
          start: [...INITIAL_CUBE_POS] as [number, number, number],
          velocity: [vx, vy, vz] as [number, number, number],
          onGround: false,
        },
      ]);
      setIsAiming(false);
      setStartX(null);
      setStartY(null);
      setPower(1);
    };
    window.addEventListener("pointerup", handleGlobalPointerUp);
    return () => window.removeEventListener("pointerup", handleGlobalPointerUp);
  }, [isAiming, aimAngle, power]);

  const handleProjectileCollision = (projectileId: number) => {
    setProjectiles((prev) =>
      prev.map((p) => (p.id === projectileId ? { ...p, onGround: true } : p))
    );
  };

  const handleTargetHit = (targetId: number) => {
    // Notifie le composant parent qu'une cible a été touchée
    onTargetHit();

    // Désactive la cible touchée en gardant sa rotation actuelle
    setTargets((prev) =>
      prev.map((t) =>
        t.id === targetId
          ? { ...t, isActive: false, rotation: t.rotation } // Garde la rotation actuelle
          : t
      )
    );

    // Génère une nouvelle position aléatoire en évitant la cible qui vient de tomber
    const hitTarget = targets.find((t) => t.id === targetId);
    let newPosition: [number, number, number];
    let attempts = 0;
    const maxAttempts = 50;

    // Calcul dynamique du viewport visible à la profondeur cible
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    const z = 12; // profondeur cible (doit matcher newZ plus bas)
    const fov = perspectiveCamera.fov * (Math.PI / 180);
    const aspect = window.innerWidth / window.innerHeight;
    const visibleHeight =
      2 * Math.tan(fov / 2) * (z - perspectiveCamera.position.z);
    const visibleWidth = visibleHeight * aspect;
    const margin = 1.2; // marge pour ne pas coller au bord
    // Réduction du champ horizontal à la moitié centrale (desktop uniquement)
    const isMobile = window.innerWidth < 640; // sm breakpoint
    const minX = isMobile
      ? -visibleWidth / 2 + margin
      : -visibleWidth / 4 + margin;
    const maxX = isMobile
      ? visibleWidth / 2 - margin
      : visibleWidth / 4 - margin;

    do {
      const newX = Math.random() * (maxX - minX) + minX;
      const newY = 2.0 + Math.random() * 2; // 2.0 à 4.0 (hauteur raisonnable)
      const newZ = 12 + Math.random() * 6; // 12 à 18 (beaucoup plus loin)
      newPosition = [newX, newY, newZ];
      attempts++;

      // Vérifie la distance avec la cible qui vient de tomber
      if (hitTarget) {
        const distance = Math.sqrt(
          Math.pow(newX - hitTarget.position[0], 2) +
            Math.pow(newY - hitTarget.position[1], 2) +
            Math.pow(newZ - hitTarget.position[2], 2)
        );

        // Si la distance est suffisante (> 4 unités), on accepte la position
        if (distance > 4) {
          break;
        }
      } else {
        // Si pas de cible trouvée, on accepte la position
        break;
      }
    } while (attempts < maxAttempts);

    // Crée une nouvelle cible active
    setTargets((prev) => [
      ...prev,
      {
        id: nextTargetId.current++,
        position: newPosition,
        isActive: true,
        rotation: [Math.PI / 2, 0, 0],
      },
    ]);
  };

  return (
    <Physics gravity={[0, -9.81, 0]} debug={false}>
      {/* Sol */}
      <RigidBody type="fixed">
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 20]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#18181b" />
        </mesh>
      </RigidBody>
      {/* Grille */}
      <gridHelper
        args={[50, 40, "#ff7a1a", "#ff7a1a"]}
        position={[0, 0.01, 20]}
      />
      {/* Cibles holographiques */}
      {targets.map((target) => (
        <RigidBody
          key={target.id}
          type={target.isActive ? "fixed" : "dynamic"}
          position={target.position}
          colliders="cuboid"
          friction={0.1}
          restitution={0.3}
          mass={target.isActive ? undefined : 0.05}
          ccd={true}
          onCollisionEnter={() => {
            if (target.isActive) {
              handleTargetHit(target.id);
            }
          }}
        >
          {/* Collider invisible plus grand pour améliorer la détection */}
          <mesh visible={false}>
            <cylinderGeometry args={[1.2, 1.2, 0.8, 16]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
          <mesh rotation={target.rotation}>
            <cylinderGeometry args={[0.8, 0.8, 0.3, 32]} />
            <meshPhysicalMaterial
              color={HOLO_COL}
              emissive={HOLO_COL}
              emissiveIntensity={target.isActive ? 0.8 : 0.2}
              metalness={1}
              roughness={0.02}
              clearcoat={1}
              clearcoatRoughness={0.02}
              transmission={0.9}
              ior={1.4}
              thickness={0.3}
              envMapIntensity={2}
            />
          </mesh>
        </RigidBody>
      ))}
      {/* Cube orange de main (pour viser) */}
      {/* Hitbox invisible plus grande sur mobile */}
      <mesh
        position={INITIAL_CUBE_POS}
        onPointerDown={handlePointerDown}
        visible={false}
        scale={[2, 2, 2]}
      >
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh
        ref={cubeRef}
        position={INITIAL_CUBE_POS}
        onPointerDown={handlePointerDown}
      >
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshPhysicalMaterial
          color="#ff9800"
          emissive="#ff9800"
          emissiveIntensity={0.7}
          metalness={0.8}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.5}
        />
      </mesh>
      {/* Projectiles dynamiques */}
      {projectiles.map((proj) => (
        <RigidBody
          key={proj.id}
          type="dynamic"
          position={proj.start}
          colliders="cuboid"
          linearVelocity={proj.velocity}
          friction={0.1}
          restitution={0.3}
          mass={8}
          ccd={true}
          onCollisionEnter={() => handleProjectileCollision(proj.id)}
        >
          <mesh>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshPhysicalMaterial
              color="#ff9800"
              emissive="#ff9800"
              emissiveIntensity={0.7}
              metalness={0.8}
              roughness={0.1}
              clearcoat={1}
              clearcoatRoughness={0.05}
              envMapIntensity={1.5}
            />
          </mesh>
        </RigidBody>
      ))}
      {/* Courbe de visée holographique avec puissance */}
      {isAiming && <AimCurve angle={aimAngle} power={power} />}
    </Physics>
  );
};

// Composant Prompt
const Prompt = ({
  onClose,
  setIsDoubleScore,
  setIsTenScore,
}: {
  onClose: () => void;
  setIsDoubleScore: (b: boolean) => void;
  setIsTenScore: (b: boolean) => void;
}) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [showMsg, setShowMsg] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && value === "x2") {
        setIsDoubleScore(true);
        setIsTenScore(false);
        setShowMsg(true);
        setTimeout(() => setShowMsg(false), 2000);
      }
      if (e.key === "Enter" && value === "x10") {
        setIsDoubleScore(false);
        setIsTenScore(true);
        setShowMsg(true);
        setTimeout(() => setShowMsg(false), 2000);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, value]);

  useEffect(() => {
    // Le mode x2 n'est appliqué que quand on appuie sur Entrée
    // setIsDoubleScore(value === "x2");
  }, [value, setIsDoubleScore]);

  return (
    <div
      className="fixed bottom-6 left-6 z-[100] bg-black/90 border border-orange-400 rounded-xl shadow-xl p-4 flex flex-col gap-2 min-w-[220px]"
      style={{ backdropFilter: "blur(6px)" }}
    >
      <label className="text-orange-300 text-sm font-bold mb-1">
        Hi there !
      </label>
      <input
        ref={inputRef}
        className="bg-black/60 border border-orange-400 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-orange-400"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {showMsg && (
        <div className="text-orange-400 text-xs mt-1 animate-pulse">
          Have fun
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <button
          className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm font-bold"
          onClick={onClose}
        >
          Fermer
        </button>
        <button
          className="px-3 py-1 bg-orange-400 text-white rounded hover:bg-orange-500 text-sm font-bold"
          onClick={() => {
            setIsDoubleScore(false);
            setIsTenScore(false);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

const CubeGame = () => {
  const [resetTrigger, setResetTrigger] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDoubleScore, setIsDoubleScore] = useState(false);
  const [isTenScore, setIsTenScore] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
    setCountdown(3);
    setTimeLeft(30);
    setScore(0);
  };

  const handleReset = () => {
    setResetTrigger((prev) => prev + 1);
    setTimeLeft(30);
    setScore(0);
    setCountdown(3);
    setGameActive(false);
    setShowFinalScore(false);
  };

  // Décompte de 3 secondes
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setGameActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Timer de 30 secondes
  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameActive(false);
          setTimeout(() => {
            setShowFinalScore(true);
          }, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive]);

  // Afficher le prompt si F10
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F10") {
        setShowPrompt(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className="w-full min-h-screen relative touch-none"
      style={{ touchAction: "none" }}
    >
      {/* Menu burger pour mobile */}
      {!showFinalScore && (
        <BurgerMenu
          onBack={() => (window.location.href = "/")}
          onReset={handleReset}
        />
      )}

      {/* Bouton de retour (desktop uniquement) */}
      <button
        onClick={() => (window.location.href = "/")}
        className="absolute top-6 left-6 z-50 border border-orange-500 text-orange-400 bg-transparent hover:bg-orange-500 hover:text-white transition-colors px-4 py-2 rounded-full font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-base sm:text-lg hidden sm:block"
        aria-label="Retour à l'accueil"
      >
        ← Back
      </button>

      {/* Écran d'accueil avec instructions */}
      {!gameStarted && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 px-2">
          <div className="relative bg-gradient-to-r from-orange-500/20 via-red-500/20 to-yellow-500/20 border border-orange-400 text-white px-4 py-6 sm:px-16 sm:py-10 rounded-xl shadow-2xl backdrop-blur-sm w-full max-w-xs sm:max-w-2xl mx-2 overflow-y-auto">
            {/* Effet holographique de fond */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-yellow-500/10 rounded-xl animate-pulse pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255, 166, 0, 0.2),transparent_50%)] rounded-xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse pointer-events-none"></div>
            <div className="relative z-10">
              <div className="text-left space-y-6 mb-8 sm:mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">
                  How to play:
                </h2>
                <div className="space-y-4 sm:space-y-5 text-base sm:text-lg">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-0 h-0 border-l-[8px] sm:border-l-[12px] border-l-orange-500 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent mt-2"></div>
                    <p className="text-white font-medium leading-relaxed">
                      <span className="text-orange-300 font-bold">
                        Tap and hold
                      </span>{" "}
                      on the orange cube to aim
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-0 h-0 border-l-[8px] sm:border-l-[12px] border-l-orange-500 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent mt-2"></div>
                    <p className="text-white font-medium leading-relaxed">
                      <span className="text-orange-300 font-bold">
                        Move your finger
                      </span>{" "}
                      to adjust angle and power
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-0 h-0 border-l-[8px] sm:border-l-[12px] border-l-orange-500 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent mt-2"></div>
                    <p className="text-white font-medium leading-relaxed">
                      <span className="text-orange-300 font-bold">Release</span>{" "}
                      to shoot the projectile
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-0 h-0 border-l-[8px] sm:border-l-[12px] border-l-orange-500 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent mt-2"></div>
                    <p className="text-white font-medium leading-relaxed">
                      <span className="text-orange-300 font-bold">
                        Hit the yellow targets
                      </span>{" "}
                      floating in the air to score points
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-0 h-0 border-l-[8px] sm:border-l-[12px] border-l-orange-500 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent mt-2"></div>
                    <p className="text-white font-medium leading-relaxed">
                      <span className="text-orange-300 font-bold">
                        30 seconds
                      </span>{" "}
                      to achieve the best score!
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={handleStartGame}
                  className="bg-orange-500 text-white w-full sm:w-32 px-4 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors border border-orange-500 shadow-lg text-base sm:text-lg"
                  aria-label="Démarrer le jeu"
                >
                  Start
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="border border-orange-500 text-orange-400 bg-transparent hover:bg-orange-500 hover:text-white transition-colors w-full sm:w-32 px-4 py-3 rounded-full font-bold shadow-lg text-base sm:text-lg"
                  aria-label="Retour à l'accueil"
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Décompte */}
      {gameStarted && countdown > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-[7rem] sm:text-[20rem] font-black text-orange-400 animate-pulse select-none">
            {countdown}
          </div>
        </div>
      )}

      {/* Bouton Reset (desktop uniquement) */}
      {gameStarted && gameActive && (
        <button
          onClick={handleReset}
          className="absolute top-6 right-6 z-50 bg-orange-500 text-white px-4 py-2 rounded-full font-bold hover:bg-orange-600 transition-colors border border-orange-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-base sm:text-lg hidden sm:block"
          aria-label="Réinitialiser le jeu"
        >
          Reset
        </button>
      )}

      {/* Grille pour l'interface mobile */}
      {gameStarted && !showFinalScore && (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-40 sm:hidden">
          {/* Menu burger - colonne de gauche */}
          <div className="absolute top-0 left-0 w-20 h-full">
            <div className="absolute top-4 left-4 pointer-events-auto">
              <BurgerMenu
                onBack={() => (window.location.href = "/")}
                onReset={handleReset}
              />
            </div>
          </div>

          {/* Scoreboard - colonne de droite (plus d'espace) */}
          <div className="absolute top-0 right-0 w-[calc(100%-5rem)] h-full">
            <div className="absolute top-4 right-4 left-4 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-yellow-500/20 border border-orange-400/50 text-white p-3 rounded-xl shadow-2xl backdrop-blur-sm">
              {/* Effet holographique de fond */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-yellow-500/10 rounded-xl animate-pulse"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,165,0,0.2),transparent_50%)] rounded-xl"></div>
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>

              <div className="relative flex flex-col gap-3 items-center justify-center">
                <div className="flex gap-8 items-center">
                  <div className="text-center">
                    <div
                      className="text-2xl font-black tracking-wider drop-shadow-[0_0_10px_rgba(255,165,0,0.5)]"
                      style={{ fontFamily: "Shutteblock, monospace" }}
                    >
                      {timeLeft}s
                    </div>
                    <div className="text-xs font-bold text-orange-300 mt-1 drop-shadow-[0_0_5px_rgba(255,165,0,0.3)]">
                      TIME
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className="text-2xl font-black tracking-wider drop-shadow-[0_0_10px_rgba(255,165,0,0.5)]"
                      style={{ fontFamily: "Shutteblock, monospace" }}
                    >
                      {score}
                    </div>
                    <div className="text-xs font-bold text-orange-300 mt-1 drop-shadow-[0_0_5px_rgba(255,165,0,0.3)]">
                      TARGETS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scoreboard desktop uniquement */}
      {gameStarted && (
        <div
          className={`z-40 transition-all duration-1000 px-2 hidden sm:block ${
            showFinalScore
              ? "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-110"
              : "absolute top-4 left-1/2 transform -translate-x-1/2 scale-100"
          }`}
        >
          <div
            className={`relative bg-gradient-to-r from-orange-500/20 via-red-500/20 to-yellow-500/20 border border-orange-400/50 text-white px-8 py-6 rounded-xl shadow-2xl backdrop-blur-sm mx-auto ${
              showFinalScore ? "w-80" : "w-80"
            }`}
          >
            {/* Effet holographique de fond */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-yellow-500/10 rounded-xl animate-pulse"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,165,0,0.2),transparent_50%)] rounded-xl"></div>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>

            <div className="relative flex flex-col gap-2 items-center justify-center">
              {!showFinalScore ? (
                <>
                  <div className="flex gap-16 items-center">
                    <div className="text-center">
                      <div
                        className="text-4xl font-black tracking-wider drop-shadow-[0_0_10px_rgba(255,165,0,0.5)]"
                        style={{ fontFamily: "Shutteblock, monospace" }}
                      >
                        {timeLeft}s
                      </div>
                      <div className="text-xs font-bold text-orange-300 mt-1 drop-shadow-[0_0_5px_rgba(255,165,0,0.3)]">
                        TIME
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-4xl font-black tracking-wider drop-shadow-[0_0_10px_rgba(255,165,0,0.5)]"
                        style={{ fontFamily: "Shutteblock, monospace" }}
                      >
                        {score}
                      </div>
                      <div className="text-xs font-bold text-orange-300 mt-1 drop-shadow-[0_0_5px_rgba(255,165,0,0.3)]">
                        TARGETS
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div
                    className="text-3xl font-black tracking-wider drop-shadow-[0_0_10px_rgba(255,165,0,0.5)] mb-2"
                    style={{ fontFamily: "Shutteblock, monospace" }}
                  >
                    Good job!
                  </div>
                  <div
                    className="text-2xl font-black tracking-wider drop-shadow-[0_0_10px_rgba(255,165,0,0.5)]"
                    style={{ fontFamily: "Shutteblock, monospace" }}
                  >
                    {score} targets in 30s
                  </div>
                  <div className="flex flex-col gap-4 justify-center w-full mt-4">
                    <button
                      onClick={handleReset}
                      className="bg-orange-500 text-white w-full px-4 py-3 rounded-full font-bold hover:bg-orange-600 transition-colors border border-orange-500 shadow-lg text-base touch-manipulation"
                      aria-label="Play Again"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={() => (window.location.href = "/")}
                      className="border border-orange-500 text-orange-400 bg-transparent hover:bg-orange-500 hover:text-white transition-colors w-full px-4 py-3 rounded-full font-bold shadow-lg text-base touch-manipulation"
                      aria-label="Retour à l'accueil"
                    >
                      ← Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showFinalScore && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 px-2 sm:px-4 py-4 sm:py-8 sm:hidden">
          <div className="relative bg-gradient-to-r from-orange-500/20 via-red-500/20 to-yellow-500/20 border border-orange-400 text-white px-4 py-6 sm:px-8 sm:py-8 lg:px-16 lg:py-10 rounded-xl shadow-2xl backdrop-blur-sm w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-2xl mx-auto overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
            {/* Effet holographique de fond */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-yellow-500/10 rounded-xl animate-pulse pointer-events-none"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255, 166, 0, 0.2),transparent_50%)] rounded-xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse pointer-events-none"></div>
            <div className="relative z-10">
              <div className="text-center space-y-3 sm:space-y-4 lg:space-y-6 mb-4 sm:mb-6 lg:mb-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-2 sm:mb-3 lg:mb-4">
                  Good job !
                </h2>
                <div className="text-sm sm:text-base lg:text-lg text-orange-400 mb-2 sm:mb-3 lg:mb-4">
                  Final Score: {score} targets in 30s
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 justify-center w-full">
                <button
                  onClick={handleReset}
                  className="bg-orange-500 text-white w-full px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 rounded-full font-bold hover:bg-orange-600 transition-colors border border-orange-500 shadow-lg text-sm sm:text-base lg:text-lg touch-manipulation"
                  aria-label="Play Again"
                >
                  Play Again
                </button>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="border border-orange-500 text-orange-400 bg-transparent hover:bg-orange-500 hover:text-white transition-colors w-full px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 rounded-full font-bold shadow-lg text-sm sm:text-base lg:text-lg touch-manipulation"
                  aria-label="Retour à l'accueil"
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPrompt && (
        <Prompt
          onClose={() => setShowPrompt(false)}
          setIsDoubleScore={setIsDoubleScore}
          setIsTenScore={setIsTenScore}
        />
      )}

      <Canvas
        camera={{ position: [0, 2, 2], fov: 60 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: gameStarted && gameActive ? "auto" : "none",
          background: "transparent",
          zIndex: 10,
          touchAction: "none",
        }}
      >
        <Scene
          key={resetTrigger}
          onTargetHit={() =>
            setScore((prev) => prev + (isTenScore ? 10 : isDoubleScore ? 2 : 1))
          }
        />
      </Canvas>
    </div>
  );
};

export default CubeGame;
