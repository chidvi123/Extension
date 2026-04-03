import React, { useState, useRef, useEffect } from "react";
import { getHeatLevel, formatTime, MONTHS, FULL_MONTHS } from "./helpers";

// Props:
//   yearData  Array<{ date: string, time: number }> — 365 entries

export default function Heatmap({ yearData }) {
  const [tooltip, setTooltip] = useState(null);
  const [viewMonth, setViewMonth] = useState("all"); // "all" or "0"–"11"
  const [cellSize, setCellSize] = useState(14);    // computed from container width
  const containerRef = useRef(null);

  // ── Build week columns (Sun → Sat), pad start with nulls ──────────────────
  const allWeeks = [];
  let week = [];
  const firstDay = new Date(yearData[0]?.date);
  for (let i = 0; i < firstDay.getDay(); i++) week.push(null);

  yearData.forEach((day) => {
    week.push(day);
    if (week.length === 7) { allWeeks.push(week); week = []; }
  });
  if (week.length) {
    while (week.length < 7) week.push(null);
    allWeeks.push(week);
  }

  // ── Compute cell size to fill full container width ─────────────────────────
  // Formula: (containerWidth - dayLabelWidth - gaps) / numWeeks
  // DAY_LABEL_W = 30px, GAP between cells = 3px
  const DAY_LABEL_W = 30;
  const GAP = 3;

  useEffect(() => {
    function compute() {
      if (!containerRef.current) return;
      const monthIdx = viewMonth === "all" ? null : parseInt(viewMonth, 10);
      const numWeeks = monthIdx !== null
        ? allWeeks.filter((w) => w.some((d) => d && new Date(d.date).getMonth() === monthIdx)).length
        : allWeeks.length;

      const available = containerRef.current.offsetWidth - DAY_LABEL_W - (numWeeks * GAP);
      const size = Math.floor(available / numWeeks);
      // Clamp between 10px (readable) and 18px (not too chunky)
      setCellSize(Math.max(10, Math.min(18, size)));
    }

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [viewMonth, allWeeks.length]);

  // ── Month label positions ──────────────────────────────────────────────────
  const monthLabels = [];
  allWeeks.forEach((w, wi) => {
    const first = w.find(Boolean);
    if (first) {
      const d = new Date(first.date);
      if (d.getDate() <= 7) monthLabels.push({ col: wi, label: MONTHS[d.getMonth()] });
    }
  });

  // ── Filter to single month when selected ──────────────────────────────────
  const monthIdx = viewMonth === "all" ? null : parseInt(viewMonth, 10);
  const displayWeeks = monthIdx !== null
    ? allWeeks.filter((w) => w.some((d) => d && new Date(d.date).getMonth() === monthIdx))
    : allWeeks;

  const CELL = cellSize;

  return (
    <div className="heatmap-wrap" ref={containerRef}>

      {/* Title left | legend + dropdown right */}
      <div className="heatmap-header">
        <h2 className="card-title" style={{ margin: 0 }}>🔥 Activity Heatmap</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Less ■■■■■ More — inline in header */}
          <div className="heatmap-legend" style={{ position: "static", margin: 0 }}>
            <span className="legend-text">Less</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <div key={l} className={`heat-cell level-${l}`} style={{ width: CELL, height: CELL }} />
            ))}
            <span className="legend-text">More</span>
          </div>
          <select
            className="hmap-dropdown"
            value={viewMonth}
            onChange={(e) => setViewMonth(e.target.value)}
          >
            <option value="all">Full Year</option>
            {FULL_MONTHS.map((m, i) => (
              <option key={m} value={String(i)}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Day labels + grid */}
      <div className="heatmap-body">

        {/* Sun/Mon/…/Sat — show only odd rows */}
        <div className="day-labels" style={{ width: DAY_LABEL_W }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
            <span key={i} className="day-lbl" style={{ height: CELL, lineHeight: `${CELL}px` }}>
              {i % 2 !== 0 ? d : ""}
            </span>
          ))}
        </div>

        {/* Grid + month labels — flex:1 so it fills remaining width */}
        <div className="heatmap-right" style={{ flex: 1 }}>
          <div
            className="heatmap-grid"
            style={{
              gridTemplateColumns: `repeat(${displayWeeks.length}, ${CELL}px)`,
              gridTemplateRows: `repeat(7, ${CELL}px)`,
            }}
          >
            {displayWeeks.flat().map((day, i) =>
              day ? (
                <div
                  key={i}
                  className={`heat-cell level-${getHeatLevel(day.time)}`}
                  style={{ width: CELL, height: CELL }}
                  onMouseEnter={(e) => {
                    const d = new Date(day.date);
                    setTooltip({
                      text: `${d.toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric", year: "numeric",
                      })} · ${day.time > 0 ? formatTime(day.time) : "no activity"}`,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ) : (
                <div key={i} className="heat-cell empty" style={{ width: CELL, height: CELL }} />
              )
            )}
          </div>

          {/* Month labels below cells — full year only */}
          {viewMonth === "all" && (
            <div
              className="month-label-row"
              style={{ gridTemplateColumns: `repeat(${allWeeks.length}, ${CELL}px)` }}
            >
              {monthLabels.map((ml) => (
                <span
                  key={ml.col}
                  className="month-lbl"
                  style={{ gridColumn: ml.col + 1 }}
                >
                  {ml.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Hover tooltip */}
      {tooltip && (
        <div className="heat-tooltip" style={{ top: tooltip.y - 44, left: tooltip.x }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}