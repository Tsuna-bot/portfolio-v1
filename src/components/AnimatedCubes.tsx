import { useEffect, useState, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

const CUBE_SIZE = 0.5;
const MOBILE_CUBE_SIZE = 1.5;
const TABLET_CUBE_SIZE = 1.0;
const VELOCITY_SAMPLES = 50;

type CubeData = {
  position: [number, number, number];
  direction: [number, number, number];
  originalDirection: [number, number, number];
  rotation: [number, number, number];
  rotationSpeed: [number, number, number];
  isDragged: boolean;
  color: string;
  isSpecial: boolean;
  isBowling?: boolean;
};

const createSpecialCube = (
  sceneWidth: number,
  sceneHeight: number
): CubeData => {
  return {
    position: [
      (Math.random() - 0.5) * sceneWidth * 0.5,
      (Math.random() - 0.5) * sceneHeight * 0.5,
      0,
    ] as [number, number, number],
    direction: [
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01,
      0,
    ] as [number, number, number],
    originalDirection: [
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01,
      0,
    ] as [number, number, number],
    rotation: [
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
    ] as [number, number, number],
    rotationSpeed: [
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
    ] as [number, number, number],
    isDragged: false,
    color: "#ffef36",
    isSpecial: true,
  };
};

const createBowlingCube = (
  sceneWidth: number,
  sceneHeight: number
): CubeData => {
  return {
    position: [
      (Math.random() - 0.5) * sceneWidth * 0.5,
      (Math.random() - 0.5) * sceneHeight * 0.5,
      0,
    ] as [number, number, number],
    direction: [
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01,
      0,
    ] as [number, number, number],
    originalDirection: [
      (Math.random() - 0.5) * 0.01,
      (Math.random() - 0.5) * 0.01,
      0,
    ] as [number, number, number],
    rotation: [
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
    ] as [number, number, number],
    rotationSpeed: [
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
    ] as [number, number, number],
    isDragged: false,
    color: "#ffffff",
    isSpecial: false,
    isBowling: true,
  };
};

const generateRandomCubes = (sceneWidth: number, sceneHeight: number) => {
  const sectionsCount = 4;
  const cubesPerSection = Math.ceil(24 / sectionsCount);

  const sectionPositions = [
    { start: -sceneWidth / 2, end: -sceneWidth / 6 },
    { start: -sceneWidth / 6, end: sceneWidth / 6 },
    { start: sceneWidth / 6, end: sceneWidth / 2 },
    { start: sceneWidth / 2, end: (sceneWidth * 5) / 6 },
  ];

  const cubes: CubeData[] = [];

  for (let sectionIndex = 0; sectionIndex < sectionsCount; sectionIndex++) {
    const section = sectionPositions[sectionIndex];
    if (!section) continue;

    const sectionWidth = section.end - section.start;

    for (let i = 0; i < cubesPerSection; i++) {
      const direction = [
        (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.01,
        0,
      ] as [number, number, number];

      cubes.push({
        position: [
          section.start + Math.random() * sectionWidth,
          (Math.random() - 0.5) * sceneHeight,
          0,
        ] as [number, number, number],
        direction: direction,
        originalDirection: [...direction] as [number, number, number],
        rotation: [
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        ] as [number, number, number],
        rotationSpeed: [
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
        ] as [number, number, number],
        isDragged: false,
        color: "#ff7a1a",
        isSpecial: false,
      });
    }
  }

  return cubes.sort(() => Math.random() - 0.5);
};

const Cube = ({
  cubeData,
  index,
  onPointerDown,
  onPointerOver,
  onPointerOut,
  specialFlicker,
  bowlingFlicker,
  cubeSize,
}: {
  cubeData: CubeData;
  index: number;
  onPointerDown: (event: ThreeEvent<PointerEvent>, index: number) => void;
  onPointerOver: () => void;
  onPointerOut: () => void;
  specialFlicker?: number;
  bowlingFlicker?: number;
  cubeSize: number;
}) => {
  return (
    <group position={cubeData.position} rotation={cubeData.rotation}>
      {/* Cube principal */}
      <mesh
        castShadow
        receiveShadow
        onPointerDown={(e) => onPointerDown(e, index)}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <boxGeometry args={[cubeSize, cubeSize, cubeSize]} />
        <meshStandardMaterial
          color={cubeData.color}
          transparent
          opacity={cubeData.isDragged ? 0.5 : 1}
          metalness={0.3}
          roughness={0.2}
          emissive={cubeData.color}
          emissiveIntensity={
            cubeData.isSpecial && specialFlicker !== undefined
              ? specialFlicker
              : cubeData.isBowling && bowlingFlicker !== undefined
              ? bowlingFlicker
              : cubeData.isDragged
              ? 0.2
              : 0.05
          }
        />
      </mesh>
    </group>
  );
};

const AnimatedCubes = ({
  sceneWidth,
  onDragStateChange,
  scrollOffset = 0,
}: {
  sceneWidth: number;
  onDragStateChange: (isDragging: boolean) => void;
  scrollOffset?: number;
}) => {
  const { camera } = useThree();
  const perspectiveCamera = camera as THREE.PerspectiveCamera;
  const sceneHeight =
    2 *
    Math.tan((perspectiveCamera.fov * Math.PI) / 360) *
    perspectiveCamera.position.z;

  // Détecter si on est sur mobile
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const currentCubeSize = isMobile
    ? MOBILE_CUBE_SIZE
    : isTablet
    ? TABLET_CUBE_SIZE
    : CUBE_SIZE;

  const [cubes, setCubes] = useState<CubeData[]>(() => {
    const specialCube = createSpecialCube(sceneWidth, sceneHeight);
    const bowlingCube = createBowlingCube(sceneWidth, sceneHeight);
    const normalCubes = generateRandomCubes(sceneWidth, sceneHeight);
    return [specialCube, bowlingCube, ...normalCubes];
  });

  const [draggedCubeId, setDraggedCubeId] = useState<number | null>(null);
  const [lastPointerPositions, setLastPointerPositions] = useState<
    THREE.Vector2[]
  >([]);

  // Flicker pour la lumière du cube spécial
  const flickerRef = useRef(0.6);
  // Flicker pour la lumière du cube bowling
  const bowlingFlickerRef = useRef(0.3);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    flickerRef.current = 0.55 + 0.15 * Math.sin(t * 8);
    bowlingFlickerRef.current = 0.25 + 0.1 * Math.sin(t * 6);
  });

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (draggedCubeId !== null && !isMobile) {
        if (lastPointerPositions.length >= 2) {
          const lastPos = lastPointerPositions[lastPointerPositions.length - 1];
          const secondLastPos =
            lastPointerPositions[lastPointerPositions.length - 2];
          if (lastPos && secondLastPos) {
            const velocityX = (lastPos.x - secondLastPos.x) * 2.0;
            const velocityY = (lastPos.y - secondLastPos.y) * 2.0;

            const minVelocity = 0.01;
            const velocityMagnitude = Math.sqrt(
              velocityX * velocityX + velocityY * velocityY
            );

            setCubes((prev) =>
              prev.map((cube, i) =>
                i === draggedCubeId
                  ? {
                      ...cube,
                      isDragged: false,
                      direction:
                        velocityMagnitude > minVelocity
                          ? [velocityX, velocityY, 0]
                          : cube.originalDirection,
                    }
                  : cube
              )
            );
          }
        } else {
          setCubes((prev) =>
            prev.map((cube, i) =>
              i === draggedCubeId
                ? {
                    ...cube,
                    isDragged: false,
                    direction: cube.originalDirection,
                  }
                : cube
            )
          );
        }

        setDraggedCubeId(null);
        setLastPointerPositions([]);
        onDragStateChange(false);
        document.body.style.cursor = "default";
      }
    };

    const handleGlobalTouchEnd = () => {
      if (draggedCubeId !== null && isMobile) {
        if (lastPointerPositions.length >= 2) {
          const lastPos = lastPointerPositions[lastPointerPositions.length - 1];
          const secondLastPos =
            lastPointerPositions[lastPointerPositions.length - 2];
          if (lastPos && secondLastPos) {
            const velocityX = (lastPos.x - secondLastPos.x) * 4.0; // Vitesse plus élevée pour mobile
            const velocityY = (lastPos.y - secondLastPos.y) * 4.0;

            const minVelocity = 0.005; // Seuil plus bas pour mobile
            const velocityMagnitude = Math.sqrt(
              velocityX * velocityX + velocityY * velocityY
            );

            setCubes((prev) =>
              prev.map((cube, i) =>
                i === draggedCubeId
                  ? {
                      ...cube,
                      isDragged: false,
                      direction:
                        velocityMagnitude > minVelocity
                          ? [velocityX, velocityY, 0]
                          : cube.originalDirection,
                    }
                  : cube
              )
            );
          }
        } else {
          setCubes((prev) =>
            prev.map((cube, i) =>
              i === draggedCubeId
                ? {
                    ...cube,
                    isDragged: false,
                    direction: cube.originalDirection,
                  }
                : cube
            )
          );
        }

        setDraggedCubeId(null);
        setLastPointerPositions([]);
        onDragStateChange(false);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (draggedCubeId !== null && isMobile) {
        // Empêcher le scroll de la page pendant le drag sur mobile
        event.preventDefault();
      }
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);
    document.addEventListener("touchend", handleGlobalTouchEnd);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("touchend", handleGlobalTouchEnd);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [draggedCubeId, lastPointerPositions, onDragStateChange, isMobile]);

  const handlePointerDown = (
    event: ThreeEvent<PointerEvent>,
    index: number
  ) => {
    const cube = cubes[index];
    if (cube && cube.isSpecial) {
      // Si c'est le cube spécial, naviguer vers le jeu
      window.location.href = "/cube-game";
      return;
    }

    if (cube && cube.isBowling) {
      // Si c'est le cube bowling, naviguer vers le jeu bowling
      window.location.href = "/bowling";
      return;
    }

    // Empêcher le comportement par défaut sur mobile pour éviter le zoom
    if (isMobile) {
      event.nativeEvent.preventDefault();
    }

    setDraggedCubeId(index);
    setCubes((prev) =>
      prev.map((cube, i) => (i === index ? { ...cube, isDragged: true } : cube))
    );
    onDragStateChange(true);

    // Ne changer le curseur que sur desktop
    if (!isMobile) {
      document.body.style.cursor = "grabbing";
    }

    setLastPointerPositions([]);
  };

  const handlePointerOver = (index: number) => {
    if (draggedCubeId === null && !isMobile) {
      const cube = cubes[index];
      if (cube && (cube.isSpecial || cube.isBowling)) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "grab";
      }
    }
  };

  const handlePointerOut = () => {
    if (draggedCubeId === null && !isMobile) {
      document.body.style.cursor = "default";
    }
  };

  useFrame((state) => {
    const { pointer } = state;

    if (draggedCubeId !== null) {
      const cube = cubes[draggedCubeId];
      if (cube) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(pointer, state.camera);

        const plane = new THREE.Plane();
        plane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3().set(0, 0, 1),
          new THREE.Vector3().set(0, 0, 0)
        );
        const intersectionPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectionPoint);

        const newPosition: [number, number, number] = [
          intersectionPoint.x,
          intersectionPoint.y,
          0,
        ];

        setCubes((prev) =>
          prev.map((cube, i) =>
            i === draggedCubeId ? { ...cube, position: newPosition } : cube
          )
        );

        // Gestion différente des positions selon mobile/desktop
        setLastPointerPositions((prev) => {
          const newPositions = [
            ...prev,
            new THREE.Vector2().set(pointer.x, pointer.y),
          ];

          // Sur mobile, on garde moins d'échantillons pour une réponse plus rapide
          const maxSamples = isMobile ? VELOCITY_SAMPLES / 2 : VELOCITY_SAMPLES;
          if (newPositions.length > maxSamples) {
            newPositions.shift();
          }
          return newPositions;
        });
      }
    }

    setCubes((prev) => {
      const updated = prev.map((cube, i) => {
        if (i === draggedCubeId || cube.isDragged) {
          return cube;
        }

        const newPosition: [number, number, number] = [
          cube.position[0] + cube.direction[0] - scrollOffset * 0.1,
          cube.position[1] + cube.direction[1],
          cube.position[2] + cube.direction[2],
        ];

        const halfHeight = sceneHeight / 2;
        const cameraX = camera.position.x;
        const cameraZ = camera.position.z;
        const fov = perspectiveCamera.fov * (Math.PI / 180);
        const aspectRatio = window.innerWidth / window.innerHeight;
        const viewportWidth = 2 * Math.tan(fov / 2) * cameraZ * aspectRatio;
        const leftBound = cameraX - viewportWidth / 2 + currentCubeSize / 2;
        const rightBound = cameraX + viewportWidth / 2 - currentCubeSize / 2;

        // Logique de rebond pour tous les cubes
        if (newPosition[0] > rightBound || newPosition[0] < leftBound) {
          cube.direction[0] *= -1;
        }

        // Logique spéciale pour les cubes spéciaux - les garder toujours visibles
        if (cube.isSpecial || cube.isBowling) {
          const isNearLeftEdge = newPosition[0] <= leftBound + CUBE_SIZE;
          const isNearRightEdge = newPosition[0] >= rightBound - CUBE_SIZE;

          // Force pour ramener le cube vers le centre de l'écran
          const centerForce = 0.01;

          if (isNearLeftEdge) {
            // Le cube est près du bord gauche, le ramener vers la droite
            cube.direction[0] = Math.max(cube.direction[0], centerForce);
          } else if (isNearRightEdge) {
            // Le cube est près du bord droit, le ramener vers la gauche
            cube.direction[0] = Math.min(cube.direction[0], -centerForce);
          }

          // Limiter la vitesse maximale pour éviter des mouvements trop rapides
          const maxSpeed = 0.02;
          cube.direction[0] = Math.max(
            -maxSpeed,
            Math.min(maxSpeed, cube.direction[0])
          );
        }

        if (
          newPosition[1] > halfHeight - currentCubeSize / 2 ||
          newPosition[1] < -halfHeight + currentCubeSize / 2
        ) {
          cube.direction[1] *= -1;
          newPosition[1] = Math.max(
            -halfHeight + currentCubeSize / 2,
            Math.min(halfHeight - currentCubeSize / 2, newPosition[1])
          );
        }

        let currentPosition = [...newPosition] as [number, number, number];
        let hasCollision = true;
        let iterationCount = 0;
        const maxIterations = 10;

        while (hasCollision && iterationCount < maxIterations) {
          hasCollision = false;
          iterationCount++;

          for (let j = 0; j < prev.length; j++) {
            if (i === j || j === draggedCubeId || prev[j]?.isDragged) continue;

            const otherCube = prev[j];
            if (!otherCube) continue;

            const dx = currentPosition[0] - otherCube.position[0];
            const dy = currentPosition[1] - otherCube.position[1];
            const dz = currentPosition[2] - otherCube.position[2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            const collisionThreshold = currentCubeSize * 1.2;
            if (distance < collisionThreshold && distance > 0.001) {
              hasCollision = true;

              const nx = dx / distance;
              const ny = dy / distance;
              const nz = dz / distance;

              const relativeVelocityX =
                cube.direction[0] - otherCube.direction[0];
              const relativeVelocityY =
                cube.direction[1] - otherCube.direction[1];
              const relativeVelocityZ =
                cube.direction[2] - otherCube.direction[2];

              const dotProduct =
                relativeVelocityX * nx +
                relativeVelocityY * ny +
                relativeVelocityZ * nz;

              if (dotProduct < 0) {
                cube.direction[0] -= dotProduct * nx * 0.95;
                cube.direction[1] -= dotProduct * ny * 0.95;
                cube.direction[2] -= dotProduct * nz * 0.95;

                otherCube.direction[0] += dotProduct * nx * 0.95;
                otherCube.direction[1] += dotProduct * ny * 0.95;
                otherCube.direction[2] += dotProduct * nz * 0.95;
              }

              const overlap = currentCubeSize - distance;
              const separationForce = overlap * 2;

              currentPosition = [
                currentPosition[0] + nx * separationForce,
                currentPosition[1] + ny * separationForce,
                currentPosition[2] + nz * separationForce,
              ] as [number, number, number];
            }
          }
        }

        const finalPosition = currentPosition;

        const newRotation: [number, number, number] = [
          cube.rotation[0] + cube.rotationSpeed[0],
          cube.rotation[1] + cube.rotationSpeed[1],
          cube.rotation[2] + cube.rotationSpeed[2],
        ];

        return {
          ...cube,
          position: finalPosition,
          rotation: newRotation,
        };
      });

      const normalCubes = updated.filter(
        (cube) => !cube.isSpecial && !cube.isBowling
      );
      const specialCube = updated.find((cube) => cube.isSpecial);
      const bowlingCube = updated.find((cube) => cube.isBowling);

      const NOMBRE_MINIMUM = 20;
      if (normalCubes.length < NOMBRE_MINIMUM - 2) {
        const toAdd = NOMBRE_MINIMUM - 2 - normalCubes.length;
        const newCubes = generateRandomCubes(sceneWidth, sceneHeight).slice(
          0,
          toAdd
        );

        const result = [];
        if (specialCube) result.push(specialCube);
        if (bowlingCube) result.push(bowlingCube);
        result.push(...normalCubes, ...newCubes);
        return result;
      }

      return updated;
    });
  });

  return (
    <>
      {cubes.map((cube, index) => (
        <Cube
          key={
            cube.isSpecial
              ? "special-cube"
              : cube.isBowling
              ? "bowling-cube"
              : index
          }
          cubeData={cube}
          index={index}
          onPointerDown={handlePointerDown}
          onPointerOver={() => handlePointerOver(index)}
          onPointerOut={handlePointerOut}
          specialFlicker={cube.isSpecial ? flickerRef.current : undefined}
          bowlingFlicker={
            cube.isBowling ? bowlingFlickerRef.current : undefined
          }
          cubeSize={currentCubeSize}
        />
      ))}
      {/* Lumière qui suit le cube spécial et scintille */}
      {cubes.map((cube) =>
        cube.isSpecial ? (
          <pointLight
            key="special-cube-light"
            position={cube.position}
            color="#ffef36"
            intensity={flickerRef.current}
            distance={2}
            decay={1}
          />
        ) : null
      )}
      {/* Lumière qui suit le cube bowling et scintille */}
      {cubes.map((cube) =>
        cube.isBowling ? (
          <pointLight
            key="bowling-cube-light"
            position={cube.position}
            color="#ffffff"
            intensity={bowlingFlickerRef.current}
            distance={2}
            decay={1}
          />
        ) : null
      )}
    </>
  );
};

export default AnimatedCubes;
