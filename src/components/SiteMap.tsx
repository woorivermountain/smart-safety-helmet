import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Worker } from '../types';
import { 
  AlertTriangle, 
  MapPin, 
  Wind, 
  Thermometer, 
  Droplets,
  Layers,
  Activity,
  ShieldAlert,
} from 'lucide-react';

interface SiteMapProps {
  workers: Worker[];
  onZoneAlert?: (zoneName: string, workersInZone: string[]) => void;
}

const ZONES = [
  { id: 'Z1', name: 'A구역', display: '자재 창고', x: 80, y: 100, w: 220, h: 180, restricted: false, color: '#3b82f6' },
  { id: 'Z2', name: 'B구역', display: '메인 건설동', x: 340, y: 80, w: 240, h: 220, restricted: false, color: '#10b981' },
  { id: 'Z3', name: 'C구역', display: '용접 및 고소 작업', x: 80, y: 320, w: 220, h: 260, restricted: true, color: '#ef4444' },
  { id: 'Z4', name: 'D구역', display: '기계실', x: 340, y: 340, w: 240, h: 110, restricted: false, color: '#eab308' },
  { id: 'Z5', name: 'E구역', display: '야적장', x: 340, y: 470, w: 240, h: 110, restricted: false, color: '#f97316' },
];

export default function SiteMap({ workers }: SiteMapProps) {
  const [hoveredWorker, setHoveredWorker] = useState<Worker | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.25); // Range: 1.0 to 2.5
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d'); // 3D XYZ perspective viewport enabled by default!
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToTopZone = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 5, behavior: 'smooth' });
    }
  };

  const scrollToBottomZone = () => {
    if (scrollRef.current) {
      // Smoothly scrolls to the C/D/E areas at the bottom of the map
      scrollRef.current.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  const getWorkerPos = (worker: Worker) => {
    const zone = ZONES.find(z => z.name === worker.location);
    if (!zone) return { x: 0, y: 0 };
    
    // Distribute workers pseudo-randomly to avoid overlaying on exact same pixel
    const seed = parseInt(worker.id) || 0;
    const x = zone.x + 35 + (seed * 43) % (zone.w - 70);
    const y = zone.y + 45 + (seed * 23) % (zone.h - 85);
    
    return { x, y };
  };

  // Convert SVG coordinate space to realistic 3D XYZ relative values
  const get3DCoords = (worker: Worker) => {
    const { x, y } = getWorkerPos(worker);
    
    // Scale X and Y to a simulated 0-150 meter field coordinates
    const virtualX = parseFloat(((x - 40) * 0.25).toFixed(1));
    const virtualY = parseFloat(((y - 40) * 0.25).toFixed(1));
    
    // Scale Z based on the worker floor (4.2 meters high per floor level)
    const virtualZ = parseFloat((worker.floor * 4.2).toFixed(1));
    
    return {
      x: virtualX,
      y: virtualY,
      z: virtualZ
    };
  };

  // Pre-calculated ticks for Rulers
  const rulerTicks = [];
  for (let val = 60; val <= 600; val += 60) {
    rulerTicks.push({
      pos: val,
      label: `${Math.round((val - 40) * 0.25)}m`
    });
  }

  return (
    <div className="w-full h-full relative bg-[#0a0a0a] rounded-2xl border border-gray-800 overflow-hidden flex flex-col shadow-2xl">
      {/* Blueprint Top HUD Header */}
      <div className="h-11 border-b border-gray-800 bg-[#141822]/90 backdrop-blur-md flex items-center justify-between px-4 z-20">
         <div className="flex items-center gap-2">
            <Layers size={13} className="text-[#f97316] animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-wider font-mono">HHS Virtual 3D Spatial Position Twin v3.5</span>
         </div>
         <div className="flex items-center gap-4">
            {/* 2D Plane vs 3D Perspective View Switcher */}
            <div className="bg-gray-950 p-0.5 rounded-lg border border-gray-800/80 flex items-center gap-0.5 shadow-inner">
               <button
                 onClick={() => setViewMode('2d')}
                 className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${
                   viewMode === '2d' 
                     ? 'bg-blue-600 text-white' 
                     : 'text-gray-400 hover:text-white'
                 }`}
               >
                 2D 평면뷰
               </button>
               <button
                 onClick={() => setViewMode('3d')}
                 className={`px-3 py-1 text-[10px] font-black rounded-md transition-all ${
                   viewMode === '3d' 
                     ? 'bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white shadow-md shadow-orange-500/10' 
                     : 'text-gray-400 hover:text-white'
                 }`}
               >
                 3D 입체 투영 (XYZ)
               </button>
            </div>

            <div className="h-4 w-px bg-gray-800" />

            <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
               <span className="inline-block w-2 h-2 rounded bg-blue-500" /> NORMAL
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
               <span className="inline-block w-2 h-2 rounded bg-red-500 animate-pulse" /> EMERGENCY
            </div>
         </div>
      </div>

      {/* Main Map Scrollable Stage Viewport with plenty of scroll space */}
      <div ref={scrollRef} className="flex-1 overflow-auto bg-[#08090d] relative p-8 select-none scrollbar-thin scrollbar-thumb-orange-500/30 scrollbar-track-transparent flex justify-start items-start">
        {/* Dynamic Zoom & Perspective Wrapper with coordinate guidelines backdrop. Extra bottom/right spacing allows deep scrolling */}
        <div 
          className="relative transition-all duration-300 ease-out origin-top-left flex items-center justify-center bg-[#0a0c10]/70 rounded-3xl p-8 border border-gray-800/40 m-2 mb-[480px] mr-[360px]"
          style={{ 
            width: `${750 * zoomLevel}px`, 
            height: `${750 * zoomLevel}px`,
            minWidth: `${750 * zoomLevel}px`,
            minHeight: `${750 * zoomLevel}px`,
            transform: viewMode === '3d' ? 'perspective(1200px) rotateX(46deg) rotateZ(-22deg) translateY(-30px)' : 'none',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Subtle Grid Backdrop Layer */}
          <div className="absolute inset-0 tech-grid opacity-[0.06] rounded-3xl pointer-events-none" />

          <svg 
            viewBox="0 0 660 660" 
            className="w-full h-full drop-shadow-[0_0_30px_rgba(249,115,22,0.05)] bg-[#0c1017] rounded-2xl border border-gray-800 overflow-visible"
          >
            {/* Compass Grid background lines */}
            <circle cx="330" cy="330" r="180" fill="none" stroke="rgba(249,115,22,0.02)" strokeWidth="1" strokeDasharray="5 5" />
            <circle cx="330" cy="330" r="300" fill="none" stroke="rgba(249,115,22,0.01)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="330" y1="20" x2="330" y2="640" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="20" y1="330" x2="640" y2="330" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="4 4" />

            {/* Virtual 3D Outer Coordinates Ruler Boundaries */}
            {/* X-Axis Horizontal Grid Ruler (Y=40) */}
            <line x1="40" y1="40" x2="620" y2="40" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
            {rulerTicks.map(t => (
              <g key={`x-t-${t.pos}`} transform={`translate(${t.pos}, 0)`}>
                <line x1="0" y1="36" x2="0" y2="44" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                <text x="0" y="30" fill="rgba(138, 138, 138, 0.7)" className="text-[8px] font-mono font-bold text-center" textAnchor="middle">
                  {t.label}
                </text>
              </g>
            ))}
            <text x="635" y="43" fill="#f97316" className="text-[9px] font-mono font-black">X (EAST)</text>

            {/* Y-Axis Vertical Grid Ruler (X=40) */}
            <line x1="40" y1="40" x2="40" y2="620" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
            {rulerTicks.map(t => (
              <g key={`y-t-${t.pos}`} transform={`translate(0, ${t.pos})`}>
                <line x1="36" y1="0" x2="44" y2="0" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />
                <text x="30" y="3" fill="rgba(138, 138, 138, 0.7)" className="text-[8px] font-mono font-bold" textAnchor="end">
                  {t.label}
                </text>
              </g>
            ))}
            <text x="40" y="635" fill="#f97316" className="text-[9px] font-mono font-black" textAnchor="middle">Y (NORTH)</text>

            {/* Z-Axis Side Elevation Marker scale (at X=620 on the right) */}
            <line x1="620" y1="40" x2="620" y2="620" stroke="rgba(138, 138, 138, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
            {[80, 260, 440, 600].map((hPos, idx) => (
              <g key={`z-scale-${idx}`} transform={`translate(620, ${hPos})`}>
                <line x1="0" y1="0" x2="6" y2="0" stroke="#f97316" strokeWidth="1" />
                <text x="10" y="3" fill="#8a8a8a" className="text-[7.5px] font-mono font-bold">
                  {`Z:+${((4 - idx) * 4.2).toFixed(1)}m`}
                </text>
              </g>
            ))}

            {/* Floor Plan Zones Layout */}
            {ZONES.map(zone => (
              <g key={zone.id} className="transition-all duration-300">
                {/* Zone Outer Highlight if restricted */}
                {zone.restricted && (
                  <motion.rect
                    animate={{ opacity: [0.03, 0.12, 0.03] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                    x={zone.x - 4} y={zone.y - 4} width={zone.w + 8} height={zone.h + 8}
                    fill="rgba(239, 68, 68, 0.15)" rx="12"
                  />
                )}
                
                {/* Blueprint rectangle boundary */}
                <rect
                  x={zone.x} y={zone.y} width={zone.w} height={zone.h}
                  fill="#11141b"
                  stroke={zone.restricted ? "rgba(239, 68, 68, 0.45)" : "rgba(37, 99, 235, 0.25)"}
                  strokeWidth="1.2" rx="10"
                />
                
                {/* Micro tech grid internally */}
                <pattern id={`zgrid-${zone.id}`} width="15" height="15" patternUnits="userSpaceOnUse">
                  <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5"/>
                </pattern>
                <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} fill={`url(#zgrid-${zone.id})`} rx="10" />

                {/* Zone Info Tag */}
                <rect 
                  x={zone.x + 8} y={zone.y + 8} width={zone.w - 16} height={18} 
                  fill="rgba(8, 10, 15, 0.8)" rx="4" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5"
                />
                <text
                  x={zone.x + 14} y={zone.y + 20}
                  fill={zone.restricted ? '#f87171' : '#60a5fa'}
                  className="text-[9px] font-mono font-black italic tracking-wide uppercase"
                >
                  {zone.name} | {zone.display}
                </text>
                
                {zone.restricted && (
                   <g transform={`translate(${zone.x + zone.w - 22}, ${zone.y + 11})`}>
                      <ShieldAlert size={11} className="text-red-500 animate-pulse" />
                   </g>
                )}
              </g>
            ))}

            {/* 3D Legend Gizmo showing X, Y, Z coordinates vector space inside the top-right aspect */}
            {viewMode === '3d' && (
              <g transform="translate(500, 480)" opacity="0.9">
                {/* Visual HUD coordinate background cage */}
                <rect x="-10" y="-10" width="115" height="115" rx="14" fill="rgba(8, 11, 16, 0.95)" stroke="rgba(249, 115, 22, 0.2)" strokeWidth="1" />
                <text x="47" y="10" fill="#f97316" className="text-[7.5px] font-mono font-black text-center" textAnchor="middle">🌐 3D AXIS PIVOT (XYZ)</text>
                
                <g transform="translate(48, 62)">
                  {/* X Axis - Red */}
                  <line x1="0" y1="0" x2="35" y2="12" stroke="#ef4444" strokeWidth="2" />
                  <text x="38" y="16" fill="#ef4444" className="text-[8px] font-mono font-black">X (E)</text>
                  
                  {/* Y Axis - Green */}
                  <line x1="0" y1="0" x2="-28" y2="24" stroke="#10b981" strokeWidth="2" />
                  <text x="-34" y="30" fill="#10b981" className="text-[8px] font-mono font-black">Y (N)</text>
                  
                  {/* Z Axis - Cyan (Altitude) */}
                  <line x1="0" y1="0" x2="0" y2="-40" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="none" />
                  <text x="0" y="-44" fill="#06b6d4" className="text-[8px] font-mono font-black" textAnchor="middle">Z (ALT)</text>

                  {/* Core white dot */}
                  <circle cx="0" cy="0" r="3.5" fill="#ffffff" />
                </g>
              </g>
            )}

            {/* Simulated Live Laser Projection of active worker positions */}
            <AnimatePresence>
              {hoveredWorker && (() => {
                const { x: gx, y: gy } = getWorkerPos(hoveredWorker);
                const is3D = viewMode === '3d';
                const wx = gx;
                const wy = is3D ? gy - (hoveredWorker.floor * 14) : gy;
                const coords = get3DCoords(hoveredWorker);

                return (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="laser">
                    {/* Laser guidance dotted lines on selection/hover - X/Y projection crosshairs */}
                    <line x1={gx} y1="40" x2={gx} y2={gy} stroke="#f97316" strokeDasharray="3 3" opacity="0.4" strokeWidth="1.2" />
                    <line x1="40" y1={gy} x2={gx} y2={gy} stroke="#f97316" strokeDasharray="3 3" opacity="0.4" strokeWidth="1.2" />

                    {is3D && (
                      <>
                        {/* 3D Vertical post projection guideline representing Z elevation */}
                        <line x1={gx} y1={gy} x2={wx} y2={wy} stroke="#06b6d4" strokeWidth="1.8" />
                        {/* Ground foot circular footprint */}
                        <circle cx={gx} cy={gy} r="4.5" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 2" />
                      </>
                    )}
                    
                    {/* Floating coordinate ruler pointer indicators */}
                    <circle cx={gx} cy="40" r="5" fill="#f97316" />
                    <text x={gx} y="55" fill="#f97316" className="text-[8px] font-mono font-black" textAnchor="middle">
                      {`X:${coords.x}m`}
                    </text>

                    <circle cx="40" cy={gy} r="5" fill="#f97316" />
                    <text x="48" y={gy + 3} fill="#f97316" className="text-[8px] font-mono font-black" textAnchor="start">
                      {`Y:${coords.y}m`}
                    </text>

                    {/* Z line project */}
                    <line x1={wx} y1={wy} x2="620" y2={wy} stroke="rgba(6, 182, 212, 0.45)" strokeDasharray="2 2" strokeWidth="1" />
                    <circle cx="620" cy={wy} r="4" fill="#06b6d4" />
                  </motion.g>
                );
              })()}
            </AnimatePresence>

            {/* Workers nodes array with real-time positioning telemetry */}
            {workers.map(worker => {
              const { x: gx, y: gy } = getWorkerPos(worker);
              const is3D = viewMode === '3d';
              const wx = gx;
              // Elevate visually based on Z-height (floor level) inside coordinate space
              const wy = is3D ? gy - (worker.floor * 14) : gy;

              const isAlert = worker.status !== 'normal';
              const zone = ZONES.find(z => z.name === worker.location);
              const isInRestricted = zone?.restricted;
              const isHighPriority = isAlert || isInRestricted;
              const coords = get3DCoords(worker);

              return (
                <g
                  key={worker.id}
                  onMouseEnter={() => setHoveredWorker(worker)}
                  onMouseLeave={() => setHoveredWorker(null)}
                  className="cursor-pointer index-50"
                >
                  {/* 3D Vertical post coordinate structure */}
                  {is3D && (
                    <g>
                      {/* Zero Elevation Footprint Ground Ellipse shadow on floor plane */}
                      <ellipse
                        cx={gx} cy={gy}
                        rx="10" ry="5.5"
                        fill="none"
                        stroke={isHighPriority ? "rgba(239, 68, 68, 0.2)" : "rgba(37, 99, 235, 0.15)"}
                        strokeWidth="1.2"
                      />
                      
                      {/* Altitude Post guide connecting ground footprint to actual node */}
                      <path 
                        d={`M ${gx} ${gy} L ${wx} ${wy}`}
                        stroke={isHighPriority ? "rgba(239, 68, 68, 0.5)" : "rgba(16, 185, 129, 0.4)"}
                        strokeWidth="1.2"
                        strokeDasharray="2 2"
                      />
                    </g>
                  )}

                  {/* Non-restless, steady safety halo around warning workers */}
                  {isHighPriority && (
                    <circle
                      cx={wx} cy={wy}
                      r={16}
                      fill={isInRestricted || worker.status === 'emergency' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.12)'}
                      stroke={isInRestricted || worker.status === 'emergency' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(234, 179, 8, 0.3)'}
                      strokeWidth="1"
                    />
                  )}

                  {/* Node Outer Ring showing elevation level height (z-index level) - STATIC (removed rotating spin animation!) */}
                  <circle
                    cx={wx} cy={wy}
                    r={10}
                    fill="none"
                    stroke={isHighPriority ? "#ef4444" : "#10b981"}
                    strokeWidth="1.5"
                    strokeDasharray={worker.floor === 3 ? "3 1" : worker.floor === 2 ? "5 2" : "none"}
                    className="opacity-70"
                  />

                  {/* Core Worker Dot */}
                  <circle
                    cx={wx} cy={wy}
                    r={5.5}
                    fill={isHighPriority ? "#ef4444" : "#2563eb"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* Core Worker Short Designation Icon Tag */}
                  <g transform={`translate(${wx - 14}, ${wy - 12})`}>
                    <rect x="0" y="0" width="28" height="8" rx="2" fill="rgba(10, 15, 23, 0.85)" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="0.5" />
                    <text x="14" y="6.5" fill="#fcfcfc" className="text-[5.5px] font-black font-mono text-center" textAnchor="middle">
                      {worker.name.substring(0, 3)}
                    </text>
                  </g>

                  {/* Miniature 3D coordinates text attached right next to the node */}
                  <text 
                    x={wx + 13} 
                    y={wy + 3} 
                    fill="#a1a1aa" 
                    className="text-[6px] font-mono font-bold tracking-tighter opacity-80 pointer-events-none"
                  >
                    {`X:${coords.x},Y:${coords.y},Z:${coords.z}`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Floating 3D Telemetry HUD - Hover Inspection */}
      <AnimatePresence>
        {hoveredWorker && (() => {
          const coords = get3DCoords(hoveredWorker);
          const hr = hoveredWorker.sensors?.heartRate || 72;
          const temp = hoveredWorker.sensors?.temp || 36.5;
          const eeg = hoveredWorker.sensors?.eeg || 85;
          const oxygen = hoveredWorker.sensors?.oxygen || 98;
          
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              className="absolute top-14 right-4 w-72 bg-[#10141d]/95 backdrop-blur-xl border border-gray-800 rounded-2xl p-4.5 z-30 shadow-2xl space-y-4"
            >
               {/* Worker Header Card */}
               <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-inner ${
                    hoveredWorker.status === 'emergency' ? 'bg-red-600 animate-pulse' : 'bg-orange-500'
                  }`}>
                     {hoveredWorker.name[0]}
                  </div>
                  <div className="flex-1">
                     <div className="flex justify-between items-start">
                        <h4 className="text-white font-black text-sm">{hoveredWorker.name}</h4>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black ${
                          hoveredWorker.status === 'normal' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/20 text-red-400 animate-pulse'
                        }`}>
                          {hoveredWorker.status.toUpperCase()}
                        </span>
                     </div>
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">{hoveredWorker.location} | {hoveredWorker.floor}층 (Z-F)</p>
                  </div>
               </div>

               {/* Simulated Live 3D Spatial Vector Coordinates Block */}
               <div className="bg-[#08090c] p-3 rounded-xl border border-gray-800/80 space-y-1.5 font-mono">
                  <span className="text-[8.5px] font-black text-orange-500 uppercase tracking-widest block border-b border-gray-800 pb-1">
                     🛰️ Dynamic 3D Spatial Vector
                  </span>
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                     <div className="bg-[#121620] p-1.5 rounded border border-gray-800/30">
                        <span className="text-[7.5px] text-gray-500 block leading-none mb-1 font-sans">X-AXIS</span>
                        <strong className="text-white font-black">{coords.x} <span className="text-[8px] text-gray-500 font-normal font-sans">M</span></strong>
                     </div>
                     <div className="bg-[#121620] p-1.5 rounded border border-gray-800/30">
                        <span className="text-[7.5px] text-gray-500 block leading-none mb-1 font-sans">Y-AXIS</span>
                        <strong className="text-white font-black">{coords.y} <span className="text-[8px] text-gray-500 font-normal font-sans">M</span></strong>
                     </div>
                     <div className="bg-[#10191c] p-1.5 rounded border border-cyan-500/20">
                        <span className="text-[7.5px] text-cyan-400 block leading-none mb-1 font-sans">HEIGHT Z</span>
                        <strong className="text-cyan-400 font-black">+{coords.z} <span className="text-[8px] text-cyan-500 font-normal font-sans">M</span></strong>
                     </div>
                  </div>
               </div>

               {/* Bio-metric arrays */}
               <div className="grid grid-cols-2 gap-2">
                  <MetricBox icon={<Activity size={12} />} label="심박자극 (HR)" value={`${hr} bpm`} color={hr > 120 ? "text-red-400" : "text-green-400"} />
                  <MetricBox icon={<Thermometer size={12} />} label="체표온도 (TEMP)" value={`${temp.toFixed(1)}°C`} color="text-orange-400" />
                  <MetricBox icon={<Layers size={13} className="text-purple-400" />} label="뇌파 index (EEG)" value={`${eeg} uV`} color="text-purple-400" />
                  <MetricBox icon={<Droplets size={12} />} label="산소포화 (SpO2)" value={`${oxygen}%`} color="text-blue-400" />
               </div>

               {/* Virtual telemetry status analyze message */}
               <div className="bg-black/35 rounded-xl p-2.5 border border-gray-800/40 flex justify-between items-center text-[10px]">
                  <span className="text-gray-500 font-bold uppercase">가속도 제어상태:</span>
                  <span className="text-emerald-400 font-black tracking-wide">● CALM (1.0G)</span>
               </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Manual Zoom Controls HUD Panel (Left Bottom Panel) */}
      <div className="absolute bottom-4 left-4 flex gap-2 z-30">
         {/* Zoom controls */}
         <div className="bg-[#131720]/95 backdrop-blur-md border border-gray-800/80 p-2 rounded-xl flex items-center gap-1.5 shadow-2xl">
            <button 
              onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
              className="p-1 h-7 w-7 rounded bg-gray-800 hover:bg-[#f97316]/20 border border-gray-700/60 hover:border-[#f97316]/50 text-white font-extrabold flex items-center justify-center transition-all text-sm active:scale-90"
              title="도면 확대"
            >
              ＋
            </button>
            <button 
              onClick={() => setZoomLevel(prev => Math.max(1.0, prev - 0.25))}
              className="p-1 h-7 w-7 rounded bg-gray-800 hover:bg-[#f97316]/20 border border-gray-700/60 hover:border-[#f97316]/50 text-white font-extrabold flex items-center justify-center transition-all text-sm active:scale-90"
              title="도면 축소"
            >
              －
            </button>
            <button 
              onClick={() => setZoomLevel(1.25)}
              className="p-1 h-7 w-7 rounded bg-gray-800 hover:bg-[#f97316]/20 border border-gray-700/60 hover:border-[#f97316]/50 text-white font-extrabold flex items-center justify-center transition-all text-[9px] active:scale-90"
              title="도면 배율 초기화"
            >
              ↺
            </button>
            <span className="text-[10px] font-mono text-gray-400 font-black px-2 select-none">
              {(zoomLevel * 100).toFixed(0)}% 배율
            </span>
         </div>

         {/* Quick-Scroll Zone Navigator */}
         <div className="bg-[#131720]/95 backdrop-blur-md border border-gray-800/80 p-1.5 rounded-xl flex items-center gap-1.5 shadow-2xl font-sans text-[10px] font-black">
            <span className="text-gray-500 px-1 text-[8px] tracking-widest font-mono font-bold uppercase">FOCUS</span>
            <button
              onClick={scrollToTopZone}
              className="px-2.5 py-1 rounded-lg bg-[#202738] hover:bg-blue-600/25 border border-blue-500/10 hover:border-blue-500/40 text-gray-300 hover:text-white select-none transition-all"
            >
              상단 (A / B 구역)
            </button>
            <button
              onClick={scrollToBottomZone}
              className="px-2.5 py-1 rounded-lg bg-[#202738] hover:bg-[#f97316]/20 border border-[#f97316]/10 hover:border-[#f97316]/40 text-gray-300 hover:text-white select-none transition-all"
            >
              하단 (C / D / E구역)
            </button>
         </div>
      </div>

      {/* Bottom Right Map Legend Details Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2.5 z-20">
         <div className="bg-[#131720]/95 backdrop-blur-md border border-gray-800/80 rounded-2xl p-3 flex gap-4 shadow-xl">
            <LegendItem icon={<Wind size={13} className="text-sky-400" />} label="풍속" value="3.8 m/s" />
            <LegendItem icon={<Thermometer size={13} className="text-orange-400 animate-pulse" />} label="평균 배기" value="23.4 °C" />
            <LegendItem icon={<Droplets size={13} className="text-blue-400" />} label="연무 농도" value="58.2 %" />
         </div>
         
         {/* Simple Active Emergency Alerts indicators */}
         {workers.some(w => w.status !== 'normal') && (
           <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-2 px-3 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-red-500">
                 <AlertTriangle size={13} className="animate-bounce" />
                 <span className="text-[9px] font-mono font-black uppercase">인명 경보 발생</span>
              </div>
              <span className="text-white font-black text-[11px] bg-red-600 px-1.5 py-0.2 rounded font-mono">
                {workers.filter(w => w.status !== 'normal').length}
              </span>
           </div>
         )}
      </div>

      {/* Geofencing Log Alarm warning signs (Bottom Left elevated above controls) */}
      <div className="absolute bottom-16 left-4 flex flex-col gap-2 pointer-events-none z-20">
        {workers.filter(w => ZONES.find(z => z.name === w.location)?.restricted).slice(0, 1).map(w => (
           <motion.div 
             key={w.id}
             initial={{ x: -60, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             className="bg-red-950/90 border border-red-500/40 p-2 px-3 rounded-xl flex items-center gap-2 shadow-xl"
           >
             <ShieldAlert className="text-red-500 animate-pulse" size={13} />
             <span className="text-[9.5px] text-white font-bold tracking-tight">
                <span className="font-black text-red-400">{w.name}</span>: 허가 구역 이상 기동 (위험 요인)
             </span>
           </motion.div>
        ))}
      </div>
    </div>
  );
}

function MetricBox({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="bg-[#121620]/60 border border-gray-800/80 rounded-xl p-2 text-left">
       <div className="flex items-center gap-1 mb-0.5 opacity-55">
          {icon}
          <span className="text-[7.5px] font-black text-white uppercase tracking-wider">{label}</span>
       </div>
       <span className={`text-[11px] font-black ${color}`}>{value}</span>
    </div>
  );
}

function LegendItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex flex-col text-left">
       <div className="flex items-center gap-1 opacity-60">
          {icon}
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-wider">{label}</span>
       </div>
       <span className="text-[11px] font-black text-white leading-tight">{value}</span>
    </div>
  );
}
