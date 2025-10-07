import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useProgress } from "@react-three/drei";
import { Clock } from "./components/Clock";
import { useEffect, useMemo, useRef, useState } from "react";
import { resolveTimeZone } from "./utils/timezone";
import "./App.css";
import { Logo } from "./components/Logo";
import { Arrow } from "./components/Arrow";

function LoadingOverlay({ clockLoading }: { clockLoading: boolean }) {
  const { active, progress } = useProgress();

  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTsRef = useRef<number>(0);

  useEffect(() => {
    if (active || clockLoading) {
      setVisible(true);
    }
  }, [active, clockLoading]);

  useEffect(() => {
    if (!visible) return;

    if (!startTsRef.current) startTsRef.current = performance.now();

    const computeFloor = (elapsedMs: number) => {
      const t = elapsedMs / 1000;
      if (t <= 6) return (t / 6) * 60;
      if (t <= 12) return 60 + ((t - 6) / 6) * 25;
      if (t <= 20) return 85 + ((t - 12) / 8) * 10;
      if (t <= 35) return 95 + ((t - 20) / 15) * 3;
      return 98;
    };

    const tick = () => {
      const now = performance.now();
      const elapsed = now - startTsRef.current;
      const floor = computeFloor(elapsed);
      const real = progress;
      const target = Math.max(floor, real, displayedProgress);

      const ease = target - displayedProgress;
      const step = Math.max(0.4, Math.min(3.0, ease * 0.35));
      const next = Math.min(98, displayedProgress + step);

      if (!active && !clockLoading) {
        const finished = displayedProgress + (100 - displayedProgress) * 0.25;
        const val = finished >= 99.8 ? 100 : finished;
        setDisplayedProgress(val);
        if (val >= 100) {
          setTimeout(() => {
            setVisible(false);
            setDisplayedProgress(0);
            startTsRef.current = 0;
          }, 150);
        }
        return;
      }

      setDisplayedProgress(Math.max(next, real));
    };

    intervalRef.current = window.setInterval(tick, 100);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [visible, active, clockLoading, progress, displayedProgress]);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
      <div
        className={`flex items-center justify-center flex-col max-w-[508px] w-full gap-8`}
      >
        <Logo />

        <div className="w-full relative">
          <div className="loader-bar">
            <div
              className="loader-bar__real"
              style={{ width: `${displayedProgress}%` }}
            />
            <div className="loader-bar__shimmer" />
          </div>
          <div className="mt-3 text-center text-white/70 text-xs font-[350]">
            {Math.round(displayedProgress)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|BlackBerry/i.test(
    navigator.userAgent
  );
}

function Onboarding() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileDevice());
  }, []);

  if (isMobile) return null;

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center justify-center z-20 gap-2">
      <Arrow />
      <p className="text-white text-xs opacity-50 font-[350]">
        ВРАЩАЙТЕ ЧАСЫ, ЗАЖАВ ЛЕВУЮ КНОПКУ МЫШИ
      </p>
    </div>
  );
}

function App() {
  const timeZone = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const tzParam = params.get("timezone") || params.get("tz");
    return resolveTimeZone(tzParam);
  }, []);
  const [offsets, setOffsets] = useState({
    second: { x: 0, y: 0, z: (195 * Math.PI) / 180 },
    minute: { x: 0, y: (0 * Math.PI) / 180, z: 0 },
    hour: { x: 0, y: (0 * Math.PI) / 180, z: 0 },
  });
  const [mountHeavyScene, setMountHeavyScene] = useState(false);
  const [clockLoading, setClockLoading] = useState(true);
  const [autoSpin, setAutoSpin] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setMountHeavyScene(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleOffsetChange = (
    hand: string,
    axis: "x" | "y" | "z",
    value: number
  ) => {
    setOffsets((prev) => ({
      ...prev,
      [hand]: {
        ...prev[hand as keyof typeof prev],
        [axis]: value,
      },
    }));
  };

  return (
    <div className="App">
      <LoadingOverlay clockLoading={clockLoading} />
      <Onboarding />

      <Canvas
        camera={{ position: [0, 0, 0.25], fov: 50 }}
        style={{ background: "#000000" }}
      >
        <directionalLight
          position={[4, 1, 5]}
          intensity={5}
          color="#ffffff"
          rotation={[
            (37 * Math.PI) / 180,
            (3 * Math.PI) / 180,
            (106 * Math.PI) / 180,
          ]}
        />

        {mountHeavyScene && (
          <>
            <Environment
              files={import.meta.env.BASE_URL + "/hdri/forest_slope_1k.hdr"}
            />
            <Clock
              position={[0, 0, 0]}
              scale={[2, 2, 2]}
              offsets={offsets}
              onOffsetChange={handleOffsetChange}
              timeZone={timeZone}
              onLoadingChange={setClockLoading}
              autoSpin={autoSpin}
              spinSpeed={0.025}
            />
          </>
        )}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.2}
          maxDistance={20}
          onStart={() => setAutoSpin(false)}
        />
      </Canvas>
    </div>
  );
}

export default App;
