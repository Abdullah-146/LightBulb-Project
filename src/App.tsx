import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";

const BULB_ON_COLOR = "#ffe066";
const BULB_OFF_COLOR = "hsl(200, 20%, 20%)";
const CORD_COLOR = "hsl(0, 0%, 60%)";
const BASE_COLOR = "hsl(0, 0%, 40%)";
const BASE_OUTLINE = "hsl(0, 0%, 60%)";
const FILAMENT_ON_COLOR = "hsl(45, 80%, 100%)";
const FILAMENT_OFF_COLOR = "hsl(0, 0%, 25%)";

export default function LightBulb() {
  const [isOn, setIsOn] = useState(false);
  const [cordY, setCordY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const controls = useAnimation();
  const [dragStartY, setDragStartY] = useState<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent<SVGCircleElement>) => {
    setIsDragging(true);
    setDragStartY(e.clientY - cordY);
    (e.target as Element).setPointerCapture(e.pointerId);
    console.log('SVG handle pointer down', e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || dragStartY === null) return;
    const newY = Math.max(0, Math.min(100, e.clientY - dragStartY));
    setCordY(newY);
    console.log('SVG handle pointer move', e.clientY, newY);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragStartY(null);
    if (cordY > 60) {
      setIsOn(prev => !prev);
      controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.3 }
      });
    }
    setCordY(0);
    console.log('SVG handle pointer up', e.clientY, cordY);
  };

  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-[#fbe7b2]"
      onClick={() => console.log('Container clicked')}
    >
      <div className="relative" style={{ border: '2px solid green', height: '400px' }}>
        <motion.svg
          width={240}
          height={400}
          viewBox="0 0 240 400"
          className="block"
          style={{ userSelect: "none" }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Cord */}
          <line
            x1={120}
            y1={220}
            x2={120}
            y2={320 + cordY}
            stroke={CORD_COLOR}
            strokeWidth={6}
            strokeLinecap="round"
          />
          
          {/* Cord end/knob (dynamic, moves with string) and is interactive */}
          <circle
            cx={120}
            cy={320 + cordY}
            r={16}
            fill={CORD_COLOR}
            stroke="#444"
            strokeWidth={2}
            style={{ cursor: 'grab' }}
            onPointerDown={handlePointerDown}
          />

          {/* PULL text on knob */}
          <text
            x={120}
            y={320 + cordY + 5}
            textAnchor="middle"
            fontSize="12"
            fill="#fff"
            pointerEvents="none"
            style={{ userSelect: 'none' }}
          >
            PULL
          </text>

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

          {/* Filament */}
          <motion.path
            d="M110 170 Q120 150 130 170"
            stroke={isOn ? FILAMENT_ON_COLOR : FILAMENT_OFF_COLOR}
            strokeWidth={6}
            fill="none"
            initial={{ opacity: 0.5 }}
            animate={{
              stroke: isOn ? FILAMENT_ON_COLOR : FILAMENT_OFF_COLOR,
              opacity: isOn ? 1 : 0.5,
              transition: { duration: 0.3 }
            }}
          />
          <motion.path
            d="M115 170 Q120 160 125 170"
            stroke={isOn ? FILAMENT_ON_COLOR : FILAMENT_OFF_COLOR}
            strokeWidth={4}
            fill="none"
            initial={{ opacity: 0.5 }}
            animate={{
              stroke: isOn ? FILAMENT_ON_COLOR : FILAMENT_OFF_COLOR,
              opacity: isOn ? 1 : 0.5,
              transition: { duration: 0.3 }
            }}
          />

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

      <motion.div 
        className="mt-6 text-xl font-bold text-gray-700"
        animate={{
          scale: isOn ? [1, 1.1, 1] : 1,
          transition: { duration: 0.3 }
        }}
      >
        {isOn ? "💡 Light is ON" : "Light is OFF"}
      </motion.div>
      <div className="mt-2 text-sm text-gray-500">cordY: {cordY.toFixed(2)}</div>
    </div>
  );
}
