import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useProgress } from "@react-three/drei";
import { Clock } from "./components/Clock";
import { useEffect, useMemo, useRef, useState } from "react";
import { resolveTimeZone } from "./utils/timezone";
import "./App.css";
import { Logo } from "./components/Logo";
import { Arrow } from "./components/Arrow";

function LoadingOverlay() {
  const { active, progress } = useProgress();

  const [displayedProgress, setDisplayedProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const lastSyncRef = useRef<number>(0);

  useEffect(() => {
    if (active) {
      setVisible(true);
    }
  }, [active]);

  useEffect(() => {
    if (!visible) return;

    const animate = (ts: number) => {
      const lastTs = lastTsRef.current || ts;
      const dt = Math.min((ts - lastTs) / 1000, 0.2);
      lastTsRef.current = ts;

      const real = progress; // 0..100
      let next = displayedProgress;

      const phase = Math.min(next, 95);
      const baseRatePerSec = phase < 70 ? 25 : phase < 90 ? 12 : 4;
      const jitter = (Math.sin(ts / 250) + 1) * 0.25;
      const increment = (baseRatePerSec + jitter) * dt;
      next = Math.min(next + increment, 98);

      const lastSync = lastSyncRef.current || 0;
      if (ts - lastSync > 1200) {
        lastSyncRef.current = ts;
        const target = Math.max(next, real);
        next = next + (target - next) * 0.35;
      }

      next = Math.max(next, real);

      if (!active) {
        const completed = next + (100 - next) * Math.min(1, dt * 6);
        setDisplayedProgress(completed);
        if (completed >= 99.8) {
          setTimeout(() => {
            setVisible(false);
            setDisplayedProgress(0);
            lastTsRef.current = 0;
            lastSyncRef.current = 0;
          }, 180);
        } else {
          rafRef.current = requestAnimationFrame(animate);
        }
        return;
      }

      setDisplayedProgress(next);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [visible, active, progress, displayedProgress]);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
      <div
        className={`flex items-center justify-center flex-col max-w-[508px] w-full gap-8`}
      >
        <Logo />

        <div className="w-full relative">
          <div className="loader-bar">
            <div className="loader-bar__auto" style={{ width: "95%" }} />
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

function Onboarding() {
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
      <LoadingOverlay />
      <Onboarding />
      <Canvas
        camera={{ position: [0, 0, 0.25], fov: 50 }}
        style={{ background: "#000000" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {mountHeavyScene && (
          <>
            <Environment preset="studio" />
            <Clock
              position={[0, 0, 0]}
              scale={[2, 2, 2]}
              offsets={offsets}
              onOffsetChange={handleOffsetChange}
              timeZone={timeZone}
            />
          </>
        )}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.2}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}

export default App;
