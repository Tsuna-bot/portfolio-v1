import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import BurgerMenu from "../components/BurgerMenu";
import LoadingPage from "../components/LoadingPage";

interface BowlingPageProps {
  onBack: () => void;
}

const PIN_POSITIONS: [number, number, number][] = [
  [0, 0.4, 35],
  [-0.5, 0.4, 35.5],
  [0.5, 0.4, 35.5],
  [-1.0, 0.4, 36],
  [0, 0.4, 36],
  [1.0, 0.4, 36],
  [-1.5, 0.4, 36.5],
  [-0.5, 0.4, 36.5],
  [0.5, 0.4, 36.5],
  [1.5, 0.4, 36.5],
];
const BALL_START: [number, number, number] = [0, 0.9, 5]; // y = 1.2 pour être encore plus haute avant le lancer

// Profil harmonisé de quille de bowling avec courbes fluides
const getPinProfile = () => [
  // Base complète et harmonieuse
  new THREE.Vector2(0.0, 0.0), // centre de la base
  new THREE.Vector2(0.02, 0.0), // début de la base
  new THREE.Vector2(0.04, 0.0), // base fine
  new THREE.Vector2(0.06, 0.005), // base qui s'élargit
  new THREE.Vector2(0.08, 0.01), // base qui s'élargit
  new THREE.Vector2(0.1, 0.02), // base qui s'élargit
  new THREE.Vector2(0.11, 0.03), // base large
  new THREE.Vector2(0.12, 0.04), // transition vers le ventre
  new THREE.Vector2(0.13, 0.05), // transition base/ventre
  new THREE.Vector2(0.14, 0.07), // galbe montant harmonieux
  new THREE.Vector2(0.15, 0.09), // galbe montant harmonieux
  new THREE.Vector2(0.16, 0.12), // galbe montant harmonieux
  new THREE.Vector2(0.17, 0.15), // galbe montant harmonieux
  new THREE.Vector2(0.18, 0.18), // ventre commence à s'arrondir
  new THREE.Vector2(0.185, 0.21), // ventre qui s'arrondit
  new THREE.Vector2(0.19, 0.24), // ventre qui s'arrondit
  new THREE.Vector2(0.195, 0.27), // VENTRE MAX (le plus large)
  new THREE.Vector2(0.19, 0.3), // ventre arrondi
  new THREE.Vector2(0.185, 0.33), // galbe descendant harmonieux
  new THREE.Vector2(0.18, 0.36), // galbe descendant harmonieux
  new THREE.Vector2(0.17, 0.39), // transition ventre/corps
  new THREE.Vector2(0.16, 0.42), // corps harmonieux
  new THREE.Vector2(0.15, 0.45), // corps harmonieux
  new THREE.Vector2(0.14, 0.48), // corps harmonieux
  new THREE.Vector2(0.13, 0.51), // corps harmonieux
  new THREE.Vector2(0.12, 0.54), // corps harmonieux
  new THREE.Vector2(0.11, 0.57), // corps harmonieux
  new THREE.Vector2(0.1, 0.6), // début cou harmonieux
  new THREE.Vector2(0.095, 0.63), // cou harmonieux
  new THREE.Vector2(0.09, 0.66), // cou harmonieux
  new THREE.Vector2(0.085, 0.69), // cou fin harmonieux
  new THREE.Vector2(0.085, 0.72), // transition cou/tête harmonieuse
  new THREE.Vector2(0.09, 0.75), // début tête harmonieux
  new THREE.Vector2(0.1, 0.78), // tête qui s'élargit harmonieusement
  new THREE.Vector2(0.11, 0.81), // tête qui s'élargit harmonieusement
  new THREE.Vector2(0.12, 0.84), // tête qui s'élargit harmonieusement
  new THREE.Vector2(0.125, 0.87), // ventre de la tête (large)
  new THREE.Vector2(0.13, 0.9), // ventre de la tête (max)
  new THREE.Vector2(0.128, 0.92), // ventre de la tête (max, arrondi)
  new THREE.Vector2(0.125, 0.94), // début rétrécissement
  new THREE.Vector2(0.12, 0.955), // rétrécissement
  new THREE.Vector2(0.11, 0.97), // rétrécissement
  new THREE.Vector2(0.09, 0.985), // rétrécissement
  new THREE.Vector2(0.07, 0.993), // rétrécissement
  new THREE.Vector2(0.045, 0.997), // rétrécissement
  new THREE.Vector2(0.025, 0.999), // rétrécissement
  new THREE.Vector2(0.012, 0.9997), // sommet très arrondi
  new THREE.Vector2(0.005, 0.99995), // sommet très arrondi
  new THREE.Vector2(0.0, 1.0), // sommet parfaitement arrondi
];

const BowlingPinMesh: React.FC<{
  castShadow?: boolean;
  receiveShadow?: boolean;
}> = ({ castShadow = true, receiveShadow = true }) => {
  const pinProfile = React.useMemo(getPinProfile, []);
  return (
    <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
      <latheGeometry args={[pinProfile, 64]} />
      <meshStandardMaterial color="#fff" metalness={0.3} roughness={0.25} />
    </mesh>
  );
};

const BowlingPinPhysic = React.forwardRef<
  React.ElementRef<typeof RigidBody>,
  { position: [number, number, number]; pinIndex: number }
>(({ position, pinIndex }, ref) => {
  return (
    <RigidBody
      key={`pin-${pinIndex}`}
      ref={ref}
      restitution={0.1}
      friction={0.8}
      position={position}
      canSleep={false}
      linearDamping={0.7}
      angularDamping={0.7}
      mass={0.4}
    >
      {/* Base solide */}
      <CuboidCollider args={[0.08, 0.05, 0.08]} position={[0, 0.025, 0]} />
      {/* Corps creux - seulement les bords */}
      <CuboidCollider args={[0.01, 0.4, 0.01]} position={[0, 0.25, 0]} />
      <CuboidCollider args={[0.01, 0.4, 0.01]} position={[0.06, 0.25, 0]} />
      <CuboidCollider args={[0.01, 0.4, 0.01]} position={[-0.06, 0.25, 0]} />
      <CuboidCollider args={[0.01, 0.4, 0.01]} position={[0, 0.25, 0.06]} />
      <CuboidCollider args={[0.01, 0.4, 0.01]} position={[0, 0.25, -0.06]} />
      <BowlingPinMesh />
    </RigidBody>
  );
});

// Boule unifiée : une seule instance qui change de type selon l'état
const BowlingBallPhysic = React.forwardRef<
  React.ElementRef<typeof RigidBody>,
  {
    position: [number, number, number];
    onPointerDown?: (e: React.PointerEvent) => void;
    isLaunched: boolean;
    launchVelocity?: [number, number, number];
    launchAngularVelocity?: [number, number, number];
  }
>(
  (
    {
      position,
      onPointerDown,
      isLaunched,
      launchVelocity,
      launchAngularVelocity,
    },
    ref
  ) => {
    // Appliquer la vélocité initiale via useEffect
    React.useEffect(() => {
      if (
        isLaunched &&
        ref &&
        "current" in ref &&
        ref.current &&
        launchVelocity
      ) {
        try {
          ref.current.setLinvel(
            {
              x: launchVelocity[0],
              y: launchVelocity[1],
              z: launchVelocity[2],
            },
            true
          );
        } catch (error) {
          console.error(
            "🎳 Erreur lors de l'application de la vélocité linéaire:",
            error
          );
        }
      }
    }, [isLaunched, launchVelocity]);

    React.useEffect(() => {
      if (
        isLaunched &&
        ref &&
        "current" in ref &&
        ref.current &&
        launchAngularVelocity
      ) {
        try {
          ref.current.setAngvel(
            {
              x: launchAngularVelocity[0],
              y: launchAngularVelocity[1],
              z: launchAngularVelocity[2],
            },
            true
          );
        } catch (error) {
          console.error(
            "🎳 Erreur lors de l'application de la vélocité angulaire:",
            error
          );
        }
      }
    }, [isLaunched, launchAngularVelocity]);

    return (
      <RigidBody
        ref={ref}
        colliders="ball"
        restitution={0.02}
        friction={0.5}
        position={position}
        canSleep={false}
        linearDamping={0.3}
        angularDamping={0.4}
        type={isLaunched ? "dynamic" : "kinematicPosition"}
        mass={40}
        ccd={true}
      >
        <mesh castShadow receiveShadow onPointerDown={onPointerDown}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshPhysicalMaterial
            color="#ff7a1a"
            emissive="#ff7a1a"
            emissiveIntensity={0.7}
            metalness={0.8}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={1.5}
          />
        </mesh>
      </RigidBody>
    );
  }
);

const BowlingLane: React.FC = () => (
  <group>
    <mesh
      position={[0, -0.1, 15]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[4, 30]} />
      <meshStandardMaterial color="#18181b" />
    </mesh>
    <mesh
      position={[-2.5, 0, 15]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[0.5, 30]} />
      <meshStandardMaterial color="#18181b" />
    </mesh>
    <mesh position={[2.5, 0, 15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[0.5, 30]} />
      <meshStandardMaterial color="#18181b" />
    </mesh>
    {[5, 10, 15, 20, 25].map((z) => (
      <mesh key={z} position={[0, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 0.1]} />
        <meshStandardMaterial color="#ff7a1a" />
      </mesh>
    ))}
  </group>
);

// Composant AimCurve - forme plate qui suit la courbe
const AimCurve = ({ angle, power }: { angle: number; power: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Courbe basée sur la vraie physique de la boule
  const start = new THREE.Vector3().set(0, 0.05, 8);

  // Calcul basé sur la vélocité réelle de la boule
  const speed = 2 * power * 6;
  const vx = Math.sin(angle) * speed;
  const vz = Math.cos(angle) * speed;

  // Point final
  const t2 = 0.6;
  const endX = vx * t2;
  const endZ = 5 + vz * t2;

  const end = new THREE.Vector3().set(endX, 0.05, endZ);

  // Ligne droite au niveau du sol
  const curve = new THREE.LineCurve3(start, end);

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
      <tubeGeometry args={[curve, 64, 0.15, 8, false]} />
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

const BowlingScene: React.FC<{
  ballRef: React.RefObject<React.ElementRef<typeof RigidBody> | null>;
  pinRefs: React.RefObject<React.ElementRef<typeof RigidBody> | null>[];
  resetSignal: number;
  ballLaunched: boolean;
  setBallLaunched: (launched: boolean) => void;
  gameFinished: boolean;
}> = ({
  ballRef,
  pinRefs,
  resetSignal,
  ballLaunched,
  setBallLaunched,
  gameFinished,
}) => {
  const { camera } = useThree();
  const [isAiming, setIsAiming] = useState(false);
  const [aimAngle, setAimAngle] = useState(0);
  const [pendingPower, setPendingPower] = useState(1);
  const [finalPower, setFinalPower] = useState(1);
  const [startX, setStartX] = useState<number | null>(null);
  const [startY, setStartY] = useState<number | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Fonction sécurisée pour réinitialiser la boule
  const resetBallSafely = useCallback(() => {
    if (ballRef.current && !isResetting) {
      try {
        setIsResetting(true);

        // Vérifier que le contexte WebGL est toujours valide
        if (ballRef.current) {
          // Mettre la boule en mode kinematic et la replacer
          ballRef.current.setBodyType(1, true); // 1 = Kinematic
          ballRef.current.setTranslation(
            { x: BALL_START[0], y: BALL_START[1], z: BALL_START[2] },
            true
          );
          ballRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
          ballRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);

          // Réinitialiser l'état
          setBallLaunched(false);
        }

        // Délai pour s'assurer que le reset est terminé
        setTimeout(() => setIsResetting(false), 200);
      } catch (error) {
        console.error(
          "🎳 Erreur lors de la réinitialisation de la boule:",
          error
        );
        setIsResetting(false);
      }
    } else {
      // ballRef.current est null ou reset en cours
    }
  }, [ballRef]);

  // Fonction sécurisée pour réinitialiser les quilles
  const resetPinsSafely = useCallback(() => {
    pinRefs.forEach((ref, i) => {
      if (ref.current && PIN_POSITIONS[i]) {
        try {
          const pos = PIN_POSITIONS[i];
          ref.current.setTranslation({ x: pos[0], y: pos[1], z: pos[2] }, true);
          ref.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
          ref.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
          ref.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
        } catch (error) {
          console.error(
            `🎳 Erreur lors de la réinitialisation de la quille ${i}:`,
            error
          );
        }
      }
    });
  }, [pinRefs]);

  // Reset la boule et les quilles quand resetSignal change
  useEffect(() => {
    if (resetSignal === 0) return; // Éviter le reset initial

    // Utiliser setTimeout pour s'assurer que les composants sont montés
    const timer = setTimeout(() => {
      if (!isResetting) {
        // Éviter les resets multiples
        resetBallSafely();
        resetPinsSafely();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [resetSignal]); // Supprimer les dépendances qui causent la boucle

  // Caméra qui se rapproche des quilles au lancer
  useFrame(() => {
    try {
      let target, lookAt;

      if (ballLaunched) {
        // Vue très rapprochée des quilles quand la boule est lancée
        target = new THREE.Vector3(0, 1.5, 25);
        lookAt = new THREE.Vector3(0, 0.4, 36);
      } else {
        // Vue d'ensemble quand la boule n'est pas lancée
        target = new THREE.Vector3(0, 2.5, 0);
        lookAt = new THREE.Vector3(0, 0.4, 36);
      }

      // Transition différente selon la direction
      const lerpSpeed = ballLaunched ? 0.01 : 0.05; // Plus rapide pour le retour
      camera.position.lerp(target, lerpSpeed);
      camera.lookAt(lookAt);
    } catch (error) {
      console.error("🎳 Erreur générale dans useFrame:", error);
    }
  });

  // Pull down and release pour lancer la boule
  useEffect(() => {
    if (!isAiming || isResetting) return;

    const handleMove = (e: PointerEvent) => {
      if (startX === null || startY === null) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY; // Plus on descend, plus la puissance augmente
      let angle = (deltaX / 200) * (Math.PI / 6);
      angle = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, angle));
      setAimAngle(angle);
      // Affichage de la puissance en temps réel (feedback visuel)
      let pow = 1 + deltaY / 150;
      pow = Math.max(0.5, Math.min(3.0, pow));
      setPendingPower(pow);
    };

    const handleUp = (e: PointerEvent) => {
      if (startX === null || startY === null || isResetting) return;

      // Calculer la puissance finale uniquement ici
      const deltaY = e.clientY - startY;
      let pow = 1 + deltaY / 150;
      pow = Math.max(0.5, Math.min(3.0, pow));
      setFinalPower(pow);
      setBallLaunched(true);
      setIsAiming(false);
      setStartX(null);
      setStartY(null);
      setPendingPower(1);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isAiming, startX, startY, isResetting]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isAiming || isResetting || gameFinished) {
      return;
    }
    setIsAiming(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setPendingPower(1);
  };

  // Calculer les vélocités de lancement basées sur la courbe de visée
  const launchVelocity: [number, number, number] | undefined = ballLaunched
    ? [
        Math.sin(aimAngle) * 2 * finalPower * 8, // Vitesse horizontale
        0, // Pas de vélocité verticale - la boule roule seulement
        Math.cos(aimAngle) * 2 * finalPower * 8, // Vitesse horizontale
      ]
    : undefined;

  const launchAngularVelocity: [number, number, number] | undefined =
    ballLaunched
      ? [
          Math.sin(aimAngle) * 0.2 * finalPower, // Très faible pour un tir droit
          0,
          Math.cos(aimAngle) * 0.2 * finalPower, // Très faible pour un tir droit
        ]
      : undefined;

  return (
    <Physics gravity={[0, -9.81, 0]} debug={false}>
      {/* Éclairage */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 10, 0]} intensity={0.8} />

      {/* Sol */}
      <RigidBody type="fixed">
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 20]}
          receiveShadow
        >
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#18181b" />
        </mesh>
      </RigidBody>

      {/* Grille */}
      <gridHelper
        args={[50, 40, "#ff7a1a", "#ff7a1a"]}
        position={[0, 0.01, 20]}
      />

      {/* Piste de bowling */}
      <BowlingLane />

      {/* Quilles physiques */}
      {PIN_POSITIONS.map((pos, i) => (
        <BowlingPinPhysic
          key={`pin-${i}`}
          ref={pinRefs[i]}
          position={pos}
          pinIndex={i}
        />
      ))}

      {/* Boule unifiée - une seule instance qui change de type */}
      <BowlingBallPhysic
        ref={ballRef}
        position={BALL_START}
        onPointerDown={handlePointerDown}
        isLaunched={ballLaunched}
        launchVelocity={launchVelocity}
        launchAngularVelocity={launchAngularVelocity}
      />

      {/* Aide à la visée type CubeGame : courbe physique */}
      {isAiming && !ballLaunched && (
        <AimCurve angle={aimAngle} power={pendingPower} />
      )}
    </Physics>
  );
};

const BowlingPage: React.FC<BowlingPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const ballRef = useRef<React.ElementRef<typeof RigidBody>>(null);
  const pinRefs = [
    useRef<React.ElementRef<typeof RigidBody>>(null),
    useRef<React.ElementRef<typeof RigidBody>>(null),
    useRef<React.ElementRef<typeof RigidBody>>(null),
    useRef<React.ElementRef<typeof RigidBody>>(null),
    useRef<React.ElementRef<typeof RigidBody>>(null),
    useRef<React.ElementRef<typeof RigidBody>>(null),
    useRef<React.ElementRef<typeof RigidBody>>(null),
    useRef<React.ElementRef<typeof RigidBody>>(null),
    useRef<React.ElementRef<typeof RigidBody>>(null),
    useRef<React.ElementRef<typeof RigidBody>>(null),
  ];
  const [gameStarted, setGameStarted] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [currentRoll, setCurrentRoll] = useState(1);
  const [rolls, setRolls] = useState<number[]>([]);
  const [gameFinished, setGameFinished] = useState(false);
  const [ballLaunched, setBallLaunched] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const handleBack = () => {
    setShowLoading(true);
    setTimeout(() => {
      navigate("/");
      onBack();
    }, 1000);
  };

  const handleStartGame = () => {
    setGameStarted(true);
    setResetSignal((s) => s + 1);
    setCurrentRoll(1);
    setRolls([]);
    setGameFinished(false);
    setBallLaunched(false);
  };

  // Gérer le passage au lancer suivant avec vérification des quilles tombées
  useEffect(() => {
    if (!gameStarted || gameFinished || !ballLaunched) return;

    // Vérifier si le jeu est terminé (même si aucune quille n'est tombée)
    if (rolls.length >= 5) {
      setGameFinished(true);
      return;
    }

    // Fonction pour compter les quilles tombées
    const countFallenPins = () => {
      let finalCount = 0;
      pinRefs.forEach((ref) => {
        if (ref.current) {
          try {
            const position = ref.current.translation();
            const rotation = ref.current.rotation();

            // Méthode de détection améliorée : vérifier l'inclinaison ET la position
            const isFallenByPosition = position.y < 0.1; // Quille très basse
            const isFallenByRotation =
              Math.abs(rotation.x) > 0.3 || Math.abs(rotation.z) > 0.3; // Quille inclinée

            // Une quille est considérée tombée si elle est basse OU très inclinée
            if (isFallenByPosition || isFallenByRotation) {
              finalCount++;
            }
          } catch {
            // Ignorer les erreurs
          }
        }
      });
      return finalCount;
    };

    // Attendre 3 secondes puis commencer à vérifier les quilles
    const initialTimeout = setTimeout(() => {
      let attempts = 0;
      const maxAttempts = 30; // Maximum 3 secondes de vérification (30 * 100ms)

      const checkPinsAndProceed = () => {
        const fallenPins = countFallenPins();
        attempts++;

        // Si toutes les quilles sont tombées OU si on a atteint le maximum d'essais
        if (fallenPins === 10 || attempts >= maxAttempts) {
          const newRolls = [...rolls, fallenPins];

          // Vérifier si c'est le 5ème lancer
          if (newRolls.length >= 5) {
            // Pour le 5ème lancer, enregistrer le score et terminer le jeu après un délai
            setRolls(newRolls);
            setBallLaunched(false);
            // Attendre 2 secondes supplémentaires avant d'afficher la popup
            setTimeout(() => {
              setGameFinished(true);
            }, 2000);
          } else {
            // Si ce n'est pas le 5ème lancer, continuer normalement
            setRolls(newRolls);
            setCurrentRoll((prev) => prev + 1);
            setBallLaunched(false);

            // Reset la boule et les quilles pour le prochain lancer
            setTimeout(() => {
              setResetSignal((s) => s + 1);
            }, 100);
          }
        } else {
          // Continuer à vérifier toutes les 100ms
          setTimeout(checkPinsAndProceed, 100);
        }
      };

      // Commencer la vérification
      checkPinsAndProceed();
    }, 3000); // Attendre 3 secondes initialement

    return () => clearTimeout(initialTimeout);
  }, [gameStarted, gameFinished, ballLaunched, rolls.length, currentRoll]);

  return (
    <div
      className="w-full min-h-screen relative touch-none"
      style={{ touchAction: "none" }}
    >
      {showLoading && (
        <div className="fixed inset-0 z-[999]">
          <LoadingPage onLoadingComplete={() => {}} />
        </div>
      )}
      {/* Bouton de retour (desktop uniquement) */}
      <button
        onClick={handleBack}
        className="absolute top-2 left-2 sm:top-6 sm:left-6 z-50 border border-orange-500 text-orange-400 bg-transparent hover:bg-orange-500 hover:text-white transition-colors px-2 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-xs sm:text-base touch-manipulation hidden sm:block"
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
                      <span className="text-orange-300 font-bold">Press</span>{" "}
                      then drag down and release to throw
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-0 h-0 border-l-[8px] sm:border-l-[12px] border-l-orange-500 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent mt-2"></div>
                    <p className="text-white font-medium leading-relaxed">
                      <span className="text-orange-300 font-bold">
                        Knock down all the pins
                      </span>{" "}
                      for a strike&nbsp;!
                    </p>
                  </div>
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 w-0 h-0 border-l-[8px] sm:border-l-[12px] border-l-orange-500 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent mt-2"></div>
                    <p className="text-white font-medium leading-relaxed">
                      <span className="text-orange-300 font-bold">
                        5 frames
                      </span>{" "}
                      to achieve the best score !
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
                  onClick={handleBack}
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

      {/* Bowling Canvas */}
      {gameStarted && (
        <div className="w-full h-full">
          <Canvas
            camera={{ position: [0, 1.5, 2], fov: 60 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "transparent",
              zIndex: 10,
              touchAction: "none",
            }}
            shadows
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
              gl.autoClear = false;
            }}
          >
            <BowlingScene
              ballRef={ballRef}
              pinRefs={pinRefs}
              resetSignal={resetSignal}
              ballLaunched={ballLaunched}
              setBallLaunched={setBallLaunched}
              gameFinished={gameFinished}
            />
          </Canvas>

          {/* Grille pour l'interface mobile */}
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-40 sm:hidden">
            {/* Menu burger - colonne de gauche */}
            <div className="absolute top-0 left-0 w-20 h-full">
              <div className="absolute top-4 left-4 pointer-events-auto">
                <BurgerMenu
                  onBack={handleBack}
                  onReset={() => {
                    setResetSignal((s) => s + 1);
                    setCurrentRoll(1);
                    setRolls([]);
                    setGameFinished(false);
                    setBallLaunched(false);
                  }}
                />
              </div>
            </div>

            {/* Scoreboard - colonne de droite (plus d'espace) */}
            <div className="absolute top-0 right-0 w-[calc(100%-5rem)] h-full">
              <div className="absolute top-4 right-4 left-4 bg-black bg-opacity-90 text-white p-3 px-1 rounded-xl border border-orange-500">
                <div className="text-center">
                  <div className="text-base sm:text-lg font-bold text-orange-400 mb-3">
                    Frame {currentRoll} / 5
                  </div>

                  {/* Score par manche avec plus d'espace */}
                  {rolls.length > 0 && (
                    <div className="mb-3 h-14">
                      <div className="flex flex-nowrap overflow-x-auto w-full gap-1 justify-center h-full scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent min-w-[260px]">
                        {rolls.map((roll, index) => (
                          <div
                            key={index}
                            className={`flex flex-col items-center justify-center h-full min-h-[32px] px-1 py-0 rounded-xl text-base font-bold border min-w-[48px] text-center leading-tight ${
                              roll === 10
                                ? "bg-green-600 text-white border-green-500"
                                : roll >= 7
                                ? "bg-orange-600 text-white border-orange-500"
                                : roll >= 4
                                ? "bg-yellow-600 text-white border-yellow-500"
                                : "bg-gray-600 text-white border-gray-500"
                            }`}
                          >
                            <div className="text-xs opacity-70 mb-1">
                              F{index + 1}
                            </div>
                            <div className="text-base font-bold">{roll}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Score total avec plus d'espace */}
                  {rolls.length > 0 && (
                    <div className="py-3 px-2 text-base sm:text-sm text-orange-300 font-extrabold w-full">
                      Total : {rolls.reduce((sum, roll) => sum + roll, 0)} / 50
                      pins
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Affichage du jeu (desktop uniquement) */}
          <div className="absolute top-4 sm:top-6 left-0 right-0 mx-auto z-40 bg-black bg-opacity-90 text-white p-2 sm:p-4 rounded-xl border border-orange-500 w-[96vw] max-w-[420px] sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:w-auto sm:max-w-[60vw] py-2 sm:py-0 hidden sm:block">
            <div className="text-center">
              <div className="text-base sm:text-lg font-bold text-orange-400 mb-2 sm:mb-3">
                Frame {currentRoll} / 5
              </div>

              {/* Score par manche sans titre */}
              {rolls.length > 0 && (
                <div className="mb-2 sm:mb-3 h-20 sm:h-auto">
                  <div className="flex flex-nowrap overflow-x-auto w-full gap-1 sm:gap-2 justify-center h-full scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent">
                    {rolls.map((roll, index) => (
                      <div
                        key={index}
                        className={`flex flex-col items-center justify-center h-full px-1 sm:px-3 rounded-xl text-xl sm:text-xs font-bold border min-w-[64px] sm:min-w-[48px] text-center leading-tight ${
                          roll === 10
                            ? "bg-green-600 text-white border-green-500"
                            : roll >= 7
                            ? "bg-orange-600 text-white border-orange-500"
                            : roll >= 4
                            ? "bg-yellow-600 text-white border-yellow-500"
                            : "bg-gray-600 text-white border-gray-500"
                        }`}
                      >
                        <div className="text-base opacity-70 mb-1 sm:mb-0">
                          F{index + 1}
                        </div>
                        <div className="text-2xl sm:text-sm font-bold">
                          {roll}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Score total */}
              {rolls.length > 0 && (
                <div className="mt-3 sm:mt-1 py-3 px-2 text-2xl sm:text-sm text-orange-300 font-extrabold w-full">
                  Total : {rolls.reduce((sum, roll) => sum + roll, 0)} / 50 pins
                </div>
              )}
            </div>
          </div>

          {/* Bouton Reset (desktop uniquement) */}
          <button
            onClick={() => {
              setResetSignal((s) => s + 1);
              setCurrentRoll(1);
              setRolls([]);
              setGameFinished(false);
              setBallLaunched(false);
            }}
            className="absolute top-2 right-2 sm:top-6 sm:right-6 z-40 bg-orange-500 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold hover:bg-orange-600 transition-colors border border-orange-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-xs sm:text-base touch-manipulation hidden sm:block"
            aria-label="Reset ball and pins"
          >
            Reset
          </button>

          {/* Popup de fin de jeu */}
          {gameFinished && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 px-2 sm:px-4 py-4 sm:py-8">
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
                      Final Score: {rolls.reduce((sum, roll) => sum + roll, 0)}
                      /50 pins
                    </div>
                    <div className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3 lg:mb-4">
                      <div className="flex flex-nowrap overflow-x-auto justify-center gap-1 sm:gap-2 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-transparent pb-1">
                        {rolls.map((roll, index) => (
                          <div
                            key={index}
                            className={`px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base font-bold border min-w-[48px] sm:min-w-[56px] lg:min-w-[64px] flex-shrink-0 ${
                              roll === 10
                                ? "bg-green-600 text-white border-green-500"
                                : roll >= 7
                                ? "bg-orange-600 text-white border-orange-500"
                                : roll >= 4
                                ? "bg-yellow-600 text-white border-yellow-500"
                                : "bg-gray-600 text-white border-gray-500"
                            }`}
                          >
                            <div className="text-xs sm:text-xs lg:text-sm opacity-75">
                              F{index + 1}
                            </div>
                            <div className="text-sm sm:text-lg lg:text-xl font-bold">
                              {roll}
                            </div>
                            <div className="text-xs sm:text-xs lg:text-sm font-bold opacity-75">
                              pins
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 justify-center w-full">
                    <button
                      onClick={() => {
                        setResetSignal((s) => s + 1);
                        setCurrentRoll(1);
                        setRolls([]);
                        setGameFinished(false);
                        setBallLaunched(false);
                      }}
                      className="bg-orange-500 text-white w-full px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4 rounded-full font-bold hover:bg-orange-600 transition-colors border border-orange-500 shadow-lg text-sm sm:text-base lg:text-lg touch-manipulation"
                      aria-label="Play Again"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={handleBack}
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
        </div>
      )}
    </div>
  );
};

export default BowlingPage;
