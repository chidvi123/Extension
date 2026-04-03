import React from "react";

// Props:
// data: [{ label, value, color }]
// showTotal: boolean (optional)

export default function PieChart({ data, showTotal = false }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const safeTotal = total || 1;

  const cx = 38, cy = 38, r = 30, strokeW = 13;
  const circ = 2 * Math.PI * r;

  let offset = 0; // start from 0

  const arcs = data.map((d) => {
    const dash = (d.value / safeTotal) * circ;

    const arc = {
      ...d,
      dash,
      offset: -offset
    };

    offset += dash; // ✅ FIXED (was -= before)

    return arc;
  });

  return (
    <div className="donut-wrap">
      <div className="donut-chart">
        <svg
          width="96"
          height="96"
          viewBox="0 0 76 76"
          style={{ transform: "rotate(-90deg)" }} // ✅ start from top cleanly
        >
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--track)"
            strokeWidth={strokeW}
          />

          {/* Segments */}
          {arcs.map((a) =>
            a.value > 0 ? (
              <circle
                key={a.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={a.color}
                strokeWidth={strokeW}
                strokeDasharray={`${a.dash} ${circ - a.dash}`}
                strokeDashoffset={a.offset}
                strokeLinecap="butt"
              />
            ) : null
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="donut-legend">
        {data.map((d) => {
          const percent = Math.round((d.value / safeTotal) * 100);

          return (
            <div key={d.label} className="donut-legend-row">
              <span className="donut-dot" style={{ background: d.color }} />
              <span className="donut-lbl">{d.label}</span>
              <span className="donut-val">
                {showTotal ? d.value : `${percent}%`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Center text */}
      {showTotal && total > 0 && (
        <div className="donut-center">
          <div className="donut-total">{total}</div>
          <div className="donut-sub">solved</div>
        </div>
      )}
    </div>
  );
}