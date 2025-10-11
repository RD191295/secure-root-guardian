import React, { useEffect, useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };

interface PCBTraceProps {
  id?: string; // optional unique id; if not provided one is generated
  // either provide `path` (array of waypoints) OR `from` + `to`
  path?: Point[];
  from?: Point;
  to?: Point;

  type?: "power" | "data" | "control" | "key";
  isActive: boolean;
  label?: string;
  dotCount?: number;
  stageComplete?: boolean;
  payload?: "key" | "power" | "data";
}

const randId = () => `trace-${Math.random().toString(36).slice(2, 9)}`;

const PCBTrace: React.FC<PCBTraceProps> = ({
  id,
  path,
  from,
  to,
  type = "data",
  isActive,
  label,
  dotCount = 3,
  stageComplete = false,
  payload,
}) => {
  // ensure we always have a unique id for textPath references
  const internalIdRef = useRef(id ?? randId());
  const pathId = internalIdRef.current;

  // build waypoints: prefer path prop, otherwise construct from->to L-shaped waypoints
  const waypoints: Point[] = useMemo(() => {
    if (Array.isArray(path) && path.length >= 2) return path;
    if (from && to) {
      const midX = Math.round((from.x + to.x) / 2);
      // L-shaped route with a horizontal-then-vertical (you can customize)
      return [
        { x: from.x, y: from.y },
        { x: midX, y: from.y },
        { x: midX, y: to.y },
        { x: to.x, y: to.y },
      ];
    }
    // fallback single point to avoid .map on undefined
    return [{ x: 0, y: 0 }, { x: 0, y: 0 }];
  }, [path, from, to]);

  // create SVG path d string from waypoints (straight segments)
  const pathD = useMemo(() => {
    return waypoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  }, [waypoints]);

  // packet symbol based on payload/type
  const getSymbol = () => {
    if (payload === "key") return "🔑";
    if (payload === "power" || type === "power") return "⚡";
    if (type === "control") return "⚙️";
    // data default: show small dot or number (numbers handled below)
    return "●";
  };

  const getColor = () => {
    switch (type) {
      case "power":
        return "#ef4444";
      case "data":
        return "#06b6d4";
      case "control":
        return "#f59e0b";
      case "key":
        return "#facc15";
      default:
        return "#9ca3af";
    }
  };

  // safe initialization for dots/symbols/speeds
  const [offsets, setOffsets] = useState<number[]>(
    () => Array.from({ length: dotCount }, (_, i) => (i / dotCount) * 100)
  );
  const [symbols, setSymbols] = useState<string[]>(
    () =>
      Array.from({ length: dotCount }, () =>
        payload === "key" ? "🔑" : type === "power" ? "⚡" : type === "control" ? "⚙️" : String(Math.floor(Math.random() * 10))
      )
  );
  const speedsRef = useRef<number[]>(
    Array.from({ length: dotCount }, () =>
      type === "power" ? 0.8 + Math.random() * 0.6 : type === "control" ? 0.5 + Math.random() * 0.4 : 0.3 + Math.random() * 0.4
    )
  );

  // update data symbols periodically for data traces (random numbers)
  useEffect(() => {
    if (!isActive || stageComplete) return;
    if (type !== "data" && payload !== "data") return;
    const t = setInterval(() => {
      setSymbols((prev) =>
        prev.map(() => String(Math.floor(Math.random() * 10)))
      );
    }, 900);
    return () => clearInterval(t);
  }, [isActive, stageComplete, type, payload]);

  // animate packet movement along the path using startOffset percentage (0-100)
  useEffect(() => {
    if (!isActive || stageComplete) return;
    const interval = setInterval(() => {
      setOffsets((prev) => prev.map((o, i) => (o + speedsRef.current[i]) % 100));
    }, 80);
    return () => clearInterval(interval);
  }, [isActive, stageComplete]);

  // fade out when stageComplete; use local opacity state
  const [opacity, setOpacity] = useState<number>(1);
  useEffect(() => {
    if (!stageComplete) {
      setOpacity(1);
      return;
    }
    let raf = 0;
    const fade = () => {
      setOpacity((p) => {
        const next = +(p - 0.03).toFixed(3);
        if (next <= 0) {
          cancelAnimationFrame(raf);
          return 0;
        }
        raf = requestAnimationFrame(fade);
        return next;
      });
    };
    fade();
    return () => cancelAnimationFrame(raf);
  }, [stageComplete]);

  // hide if not active and not fading
  if (!isActive && !stageComplete && opacity === 0) return null;
  if (!isActive && !stageComplete) return null;

  // helper to compute a point along the total path by percentage.
  // We approximate by interpolating segments proportionally to segment length.
  const getPointAtPercent = (pct: number) => {
    // clamp
    const p = Math.max(0, Math.min(100, pct));
    // build segments lengths
    const segs = waypoints.slice(1).map((pt, i) => {
      const prev = waypoints[i];
      const dx = pt.x - prev.x;
      const dy = pt.y - prev.y;
      return Math.hypot(dx, dy);
    });
    const total = segs.reduce((a, b) => a + b, 0) || 1;
    const target = (p / 100) * total;
    let acc = 0;
    for (let i = 0; i < segs.length; i++) {
      const segLen = segs[i];
      if (acc + segLen >= target) {
        const prev = waypoints[i];
        const next = waypoints[i + 1];
        const remain = target - acc;
        const t = segLen === 0 ? 0 : remain / segLen;
        const x = prev.x + (next.x - prev.x) * t;
        const y = prev.y + (next.y - prev.y) * t;
        return { x, y };
      }
      acc += segLen;
    }
    // fallback to last point
    const last = waypoints[waypoints.length - 1];
    return { x: last.x, y: last.y };
  };

  const packetSize = payload === "key" || type === "power" ? 18 : type === "control" ? 16 : 12;

  return (
    <g opacity={opacity}>
      {/* wide faint background "pipe" */}
      <path
        d={pathD}
        stroke={getColor()}
        strokeWidth={18}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.18}
      />
      {/* outline */}
      <path
        d={pathD}
        stroke={getColor()}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* moving packet symbols placed via computed positions (safe, no textPath lookup) */}
      {offsets.map((off, i) => {
        const pt = getPointAtPercent(off);
        const sym = payload === "key" ? "🔑" : payload === "power" ? "⚡" : type === "control" ? "⚙️" : symbols[i] ?? getSymbol();
        return (
          <text
            key={i}
            x={pt.x}
            y={pt.y + 4}
            fontSize={packetSize}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill={getColor()}
            style={{ pointerEvents: "none" }}
            opacity={0.8}
          >
            {sym}
          </text>
        );
      })}

      {/* optional label centered on bounding box of waypoints */}
      {label && (() => {
        const xs = waypoints.map((w) => w.x);
        const ys = waypoints.map((w) => w.y);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
        return (
          <text x={cx} y={cy - 16} fill={getColor()} fontSize={12} textAnchor="middle">
            {label}
          </text>
        );
      })()}
    </g>
  );
};

export default PCBTrace;
