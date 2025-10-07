import { useRef, useEffect, useState } from "react";
import { Center } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Euler, Group, Mesh, Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getZonedNowParts } from "../utils/timezone";

interface ClockProps {
  position?: [number, number, number];
  scale?: [number, number, number];
  offsets?: {
    second: { x: number; y: number; z: number };
    minute: { x: number; y: number; z: number };
    hour: { x: number; y: number; z: number };
  };
  onOffsetChange?: (hand: string, axis: "x" | "y" | "z", value: number) => void;
  timeZone?: string;
  onLoadingChange?: (loading: boolean) => void;
  autoSpin?: boolean;
  spinSpeed?: number; // radians per second
}

export function Clock({
  position = [0, 0, 0],
  scale = [1, 1, 1],
  offsets: externalOffsets,
  timeZone = "Europe/Moscow",
  onLoadingChange,
  autoSpin = false,
  spinSpeed = 0.1,
}: ClockProps) {
  const modelUrl = `${import.meta.env.BASE_URL}Putnik.glb`;
  const clockRef = useRef<Group>(null);
  const [scene, setScene] = useState<Group | null>(null);
  const [handsFound, setHandsFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const secondHandRef = useRef<Mesh>(null);
  const minuteHandRef = useRef<Mesh>(null);
  const secondMinuteHandRef = useRef<Mesh>(null);
  const hourHandRef = useRef<Mesh>(null);
  const secondHourHandRef = useRef<Mesh>(null);

  const dialRef = useRef<Mesh>(null);
  const spinnerRef = useRef<Mesh>(null);

  const loadAsync = (url: string): Promise<Group> => {
    return new Promise((resolve) => {
      const loader = new GLTFLoader();
      loader.load(url, (gltf: GLTF) => {
        resolve(gltf.scene);
      });
    });
  };

  useEffect(() => {
    loadAsync(modelUrl).then((loadedScene) => {
      setScene(loadedScene);
      setLoading(false);
      onLoadingChange?.(false);
    });
  }, [modelUrl, onLoadingChange]);

  useEffect(() => {
    if (scene) {
      let foundHands = 0;
      scene.traverse((child: Object3D) => {
        if (child instanceof Mesh) {
          console.log(child.name);
          switch (child.name) {
            case "Cylinder001":
              secondHandRef.current = child;
              foundHands++;
              break;
            case "Hand_Min001":
              secondMinuteHandRef.current = child;
              break;
            case "Cylinder003":
              dialRef.current = child;
              break;
            case "Cylinder004":
              spinnerRef.current = child;
              break;
            case "Hand_Min001_1":
              minuteHandRef.current = child;
              foundHands++;
              break;
            case "Hand_Hour001_1":
              hourHandRef.current = child;
              foundHands++;
              break;

            case "Hand_Hour001":
              secondHourHandRef.current = child;
              break;
            default:
              break;
          }
        }
      });
      setHandsFound(foundHands === 3);
    }
  }, [scene]);

  useFrame((_, delta) => {
    if (!handsFound) return;

    // Apply gentle idle spin to the whole clock group when enabled
    if (autoSpin && clockRef.current) {
      clockRef.current.rotation.y += spinSpeed * delta;
    }

    const {
      seconds,
      minutes,
      hours: hours24,
      date,
    } = getZonedNowParts(timeZone);
    const hours = hours24 % 12;

    const currentOffsets = externalOffsets || {
      second: { x: 0, y: 0, z: 0 },
      minute: { x: 0, y: 0, z: 0 },
      hour: { x: 0, y: 0, z: 0 },
    };

    const secondAngle = -(seconds / 60) * Math.PI * 2;
    const minuteAngle = -(minutes / 60) * Math.PI * 2;
    const hourAngle = -((hours + minutes / 60) / 12) * Math.PI * 2;

    if (secondHandRef.current) {
      secondHandRef.current.setRotationFromEuler(
        new Euler(
          currentOffsets.second.x,
          currentOffsets.second.y,
          currentOffsets.second.z + secondAngle
        )
      );
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.setRotationFromEuler(
        new Euler(
          currentOffsets.minute.x,
          currentOffsets.minute.y + minuteAngle,
          currentOffsets.minute.z
        )
      );
    }

    if (secondMinuteHandRef.current) {
      secondMinuteHandRef.current.setRotationFromEuler(
        new Euler(
          currentOffsets.minute.x,
          currentOffsets.minute.y + minuteAngle,
          currentOffsets.minute.z
        )
      );
    }

    if (dialRef.current) {
      dialRef.current.setRotationFromEuler(
        new Euler(0, 0, (0.5 + (360 / 31) * (date - 6 - 1)) * (Math.PI / 180))
      );
    }

    if (spinnerRef.current) {
      spinnerRef.current.setRotationFromEuler(new Euler(0, 0, 0));
    }

    if (hourHandRef.current) {
      hourHandRef.current.setRotationFromEuler(
        new Euler(
          currentOffsets.hour.x,
          currentOffsets.hour.y + hourAngle,
          currentOffsets.hour.z
        )
      );
    }

    if (secondHourHandRef.current) {
      secondHourHandRef.current.setRotationFromEuler(
        new Euler(
          currentOffsets.hour.x,
          currentOffsets.hour.y + hourAngle,
          currentOffsets.hour.z
        )
      );
    }
  });

  if (loading || !scene) {
    return null;
  }

  return (
    <group ref={clockRef} position={position} scale={scale}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}
