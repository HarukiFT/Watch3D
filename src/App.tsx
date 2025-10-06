import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useProgress } from "@react-three/drei";
import { Clock } from "./components/Clock";
import { useEffect, useMemo, useState } from "react";
import { resolveTimeZone } from "./utils/timezone";
import "./App.css";
import { Logo } from "./components/Logo";
import { Arrow } from "./components/Arrow";

function LoadingOverlay() {
  const { active, progress } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const animate = (t: number) => {
      if (progress > 0) {
        setDisplayProgress((p) => Math.max(p, progress));
      } else if (active) {
        const elapsed = (t - start) / 1000;
        const target = 90 * (1 - Math.exp(-elapsed / 6));
        setDisplayProgress((p) => (p < target ? target : p));
      }
      if (active) raf = requestAnimationFrame(animate);
    };
    if (active) raf = requestAnimationFrame(animate);
    else setDisplayProgress(100);
    return () => cancelAnimationFrame(raf);
  }, [active, progress]);

  if (!active) return null;
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
      <div
        className={`flex items-center justify-center flex-col max-w-[508px] w-full gap-11`}
      >
        <Logo />

        <div className=" w-full relative">
          <div className="h-[1px] bg-[#363636] w-full absolute top-0 left-0">
            <div
              className="h-[1px] bg-[#FFFFFF] w-0 absolute top-0 left-0"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Onboarding() {
  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center justify-center z-20 gap-3">
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

        <Environment
          files={`${import.meta.env.BASE_URL}hdri/studio_small_03_1k.hdr`}
          background={false}
        />

        <Clock
          position={[0, 0, 0]}
          scale={[2, 2, 2]}
          offsets={offsets}
          onOffsetChange={handleOffsetChange}
          timeZone={timeZone}
        />

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
