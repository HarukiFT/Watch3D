import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Clock } from "./components/Clock";
import { useMemo, useState } from "react";
import { resolveTimeZone } from "./utils/timezone";
import "./App.css";

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
      <Canvas
        camera={{ position: [0, 0, 0.25], fov: 50 }}
        style={{ background: "#000000" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        <Environment preset="studio" />

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
