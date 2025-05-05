import React, { useState } from "react";
import { motion, useAnimation, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";

const BULB_ON_COLOR = "#ffe066";
const BULB_OFF_COLOR = "hsl(200, 20%, 20%)";
const CORD_COLOR = "hsl(0, 0%, 60%)";
const BASE_COLOR = "hsl(0, 0%, 40%)";
const BASE_OUTLINE = "hsl(0, 0%, 60%)";
const FILAMENT_ON_COLOR = "hsl(45, 80%, 100%)";
const FILAMENT_OFF_COLOR = "hsl(0, 0%, 25%)";


// Returns both the SVG path and the last (x, y) point for the knob
function getWavyCordPathWithEnd(knobX: number, knobY: number, amplitude: number, phase: number) {
  const segments = 16;
  const length = knobY - 220;
  const step = length / segments;
  let path = `M ${knobX} 220`;
  let lastX = knobX;
  let lastY = 220;
  for (let i = 1; i <= segments; i++) {
    const y = 220 + i * step;
    const decay = Math.exp(-i / (segments * 0.7));
    const wave = amplitude * decay * Math.sin((Math.PI * i) / segments + phase);
    const x = knobX + wave * 18;
    path += ` L ${x} ${y}`;
    lastX = x;
    lastY = y;
  }
  return { path, lastX, lastY };
}

export default function LightBulb() {
  const cordY = useMotionValue(0);
  const amplitude = useMotionValue(0);
  const phase = useMotionValue(0);
  const knobY = useTransform(cordY, v => 320 + v);
  const [isOn, setIsOn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const controls = useAnimation();

  // Cord path state for animation
  const [{ path: cordPath, lastX: knobX, lastY: knobTipY }, setCordPath] = useState(() => getWavyCordPathWithEnd(120, 320, 0, 0));

  // Animate the cord path and knob tip on every frame
  React.useEffect(() => {
    const update = () => {
      setCordPath(getWavyCordPathWithEnd(120, knobY.get(), amplitude.get(), phase.get()));
    };
    const unsub1 = knobY.on("change", update);
    const unsub2 = amplitude.on("change", update);
    const unsub3 = phase.on("change", update);
    update();
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [knobY, amplitude, phase]);

  const handlePointerDown = (e: React.PointerEvent<SVGCircleElement>) => {
    setIsDragging(true);
    setDragStartY(e.clientY - cordY.get());
    amplitude.set(0); // No wave while dragging
    phase.set(0);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || dragStartY === null) return;
    const newY = Math.max(0, Math.min(100, e.clientY - dragStartY));
    cordY.set(newY);
    amplitude.set(0);
    phase.set(0);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragStartY(null);
    if (cordY.get() > 60) {
      setIsOn(prev => !prev);
      controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.3 }
      });
    }
    animate(cordY, 0, { type: 'spring', stiffness: 300, damping: 15 });
    // Animate amplitude and phase for a traveling, decaying wave
    animate(amplitude, 1, {
      type: 'spring',
      stiffness: 100,
      damping: 8,
      onUpdate: v => amplitude.set(v)
    }).then(() => {
      animate(amplitude, 0, {
        type: 'spring',
        stiffness: 80,
        damping: 10,
        onUpdate: v => amplitude.set(v)
      });
    });
    animate(phase, 4 * Math.PI, {
      duration: 1.2,
      ease: "linear",
      onUpdate: v => phase.set(v)
    });
  };

  return (
    <div className="transition-colors duration-300" style={{ background: isOn ? BULB_ON_COLOR : '#232323', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="relative"   >
        <motion.svg
          width={240}
          height={600}
          viewBox="0 0 240 600"
          className="block"
          style={{ userSelect: "none" }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Wavy Cord */}
          <motion.path
            d={cordPath}
            stroke={CORD_COLOR}
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
          />
          {/* Cord end/knob (dynamic, moves with string) and is interactive */}
          <motion.circle
            cx={knobX}
            cy={knobTipY}
            r={16}
            fill={CORD_COLOR}
            stroke="#444"
            strokeWidth={2}
            style={{ cursor: 'grab' }}
            onPointerDown={handlePointerDown}
            animate={{}}
          />
          {/* PULL text on knob */}
          <motion.text
            x={knobX}
            y={knobTipY}
            dy={5}
            textAnchor="middle"
            fontSize="12"
            fill="#fff"
            pointerEvents="none"
            style={{ userSelect: 'none' }}
            animate={{}}
          >
            PULL
          </motion.text>
          {/* Bulb base */}
          <motion.rect
            x={90}
            y={180}
            width={60}
            height={50}
            rx={20}
            fill={BASE_COLOR}
            stroke={BASE_OUTLINE}
            strokeWidth={4}
          />
          {/* Bulb outline */}
          <motion.ellipse
            cx={120}
            cy={120}
            rx={90}
            ry={90}
            fill={isOn ? BULB_ON_COLOR : BULB_OFF_COLOR}
            stroke="#222"
            strokeWidth={6}
            animate={controls}
          />
          {/* Bulb shine */}
          <motion.path
            d="M80 80 Q100 60 130 80"
            stroke="#fff"
            strokeWidth={8}
            fill="none"
            initial={{ opacity: 0.1 }}
            animate={{
              opacity: isOn ? 0.4 : 0.1,
              transition: { duration: 0.3 }
            }}
          />
          {/* Realistic filament: zigzag with glow when on */}
          <motion.path
            d="M110 170 L115 160 L120 170 L125 160 L130 170"
            stroke={isOn ? FILAMENT_ON_COLOR : FILAMENT_OFF_COLOR}
            strokeWidth={isOn ? 4 : 3}
            fill="none"
            filter={isOn ? 'url(#filament-glow)' : undefined}
            initial={{ opacity: 0.5 }}
            animate={{
              stroke: isOn ? FILAMENT_ON_COLOR : FILAMENT_OFF_COLOR,
              opacity: isOn ? 1 : 0.5,
              transition: { duration: 0.3 }
            }}
          />
          {/* Filament glow filter */}
          <defs>
            <filter id="filament-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Glow effect when on */}
          <AnimatePresence>
            {isOn && (
              <motion.circle
                cx={120}
                cy={120}
                r={100}
                fill="none"
                stroke="#f5e0a3"
                strokeWidth={10}
                strokeDasharray="10,30"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </AnimatePresence>
        </motion.svg>
      </div>
     
    </div>
  );
}
