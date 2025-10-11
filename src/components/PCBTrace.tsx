import React, { useEffect, useMemo, useRef, useState } from "react";

type Point = { x: number; y: number };

interface PCBTraceProps {
  id?: string;
  // Either pass `path` (waypoints) OR `from` + `to`
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
  const internalIdRef = useRef(id ?? randId());
  const pathId = internalIdRef.current;

  // Build waypoints safely: prefer path prop, otherwise build simple L-shaped from->to
  const waypoints: Point[] = useMemo(() => {
    if (Array.isArray(path) && path.length >= 2) return path;
    if (from && to) {
      const midX = Math.round((from.x + to.x) / 2);
      return [
        { x: from.x, y: from.y },
        { x: midX, y: from.y },
        { x: midX, y: to.y },
        { x: to.x, y: to.y },
      ];
    }
    // fallback to a tiny path to avoid undefined .map usage
    return [{ x: 0, y: 0 }, { x: 0, y: 0 }];
  }, [path, from, to]);

  // Convert waypoints to SVG path d
  const pathD = useMemo(
    () => waypoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" "),
    [waypoints]
  );

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

  // initialize offsets and symbols defensively
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

  // randomize data symbols periodically for data traces
  useEffect(() => {
    if (!isActive || stageComplete) return;
    if (type !== "data" && payload !== "data") return;
    const t = setInterval(() => {
      setSymbols((prev) => prev.map(() => String(Math.floor(Math.random() * 10))));
    }, 900);
    return () => clearInterval(t);
  }, [isActive, stageComplete, type, payload]);

  // animate offsets when active
  useEffect(() => {
    if (!isActive || stageComplete) return;
    const interval = setInterval(() => {
      setOffsets((prev) => prev.map((o, i) => (o + speedsRef.current[i]) % 100));
    }, 80);
    return () => clearInterval(interval);
  }, [isActive, stageComplete]);

  // fade out on stageComplete
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

  // hide early if not active and not in fade
  if (!isActive && !stageComplete) return null;

  // helper: get point along multi-segment path by percent (0-100)
  const getPointAtPercent = (pct: number) => {
    const p = Math.max(0, Math.min(100, pct));
    const segs = waypoints.slice(1).map((pt, i) => {
      const prev = waypoints[i];
      return Math.hypot(pt.x - prev.x, pt.y - prev.y);
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
        return {
          x: prev.x + (next.x - prev.x) * t,
          y: prev.y + (next.y - prev.y) * t,
        };
      }
      acc += segLen;
    }
    return waypoints[waypoints.length - 1];
  };

  const packetSize = payload === "key" || type === "power" ? 18 : type === "control" ? 16 : 12;

  return (
    <g opacity={opacity}>
      {/* thick semi-transparent pipeline */}
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

      {/* moving packets */}
      {offsets.map((off, i) => {
        const pt = getPointAtPercent(off);
        const sym =
          payload === "key"
            ? "🔑"
            : payload === "power"
            ? "⚡"
            : type === "control"
            ? "⚙️"
            : symbols[i] ?? "●";
        return (
          <text
            key={i}
            x={pt.x}
            y={pt.y + 4}
            fontSize={packetSize}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill={getColor()}
            opacity={0.9}
            style={{ pointerEvents: "none" }}
          >
            {sym}
          </text>
        );
      })}

      {/* label (centroid of bbox) */}
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
