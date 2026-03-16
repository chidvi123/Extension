import React from "react";

// Props:
//   easy   {number} - count of easy problems solved
//   medium {number} - count of medium problems solved
//   hard   {number} - count of hard problems solved

export default function PieChart({ easy, medium, hard }) {
  const total = easy + medium + hard || 1;

  const slices = [
    { label: "Easy",   value: easy,   color: "#10b981" },
    { label: "Medium", value: medium, color: "#f59e0b" },
    { label: "Hard",   value: hard,   color: "#ef4444" },
  ];

  // Build SVG arc paths for each slice
  let cum = -Math.PI / 2; // start from the top (12 o'clock)
  const cx = 80, cy = 80, r = 68;

  const paths = slices.map((s) => {
    const angle = (s.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cum);
    const y1 = cy + r * Math.sin(cum);
    cum += angle;
    const x2 = cx + r * Math.cos(cum);
    const y2 = cy + r * Math.sin(cum);
    const largeArc = angle > Math.PI ? 1 : 0;
    return {
      ...s,
      d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`,
    };
  });

  return (
    <div className="pie-wrap">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* Show grey circle when no data, otherwise draw slices */}
        {total === 1
          ? <circle cx={cx} cy={cy} r={r} fill="#252d3d" />
          : paths.map((p) => (
              <path
                key={p.label}
                d={p.d}
                fill={p.color}
                stroke="var(--card)"
                strokeWidth="2"
              />
            ))
        }

        {/* Donut hole punched out of the center */}
        <circle cx={cx} cy={cy} r={38} fill="var(--card)" />

        {/* Center text: total count */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text)" fontSize="18" fontWeight="700">
          {easy + medium + hard}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text3)" fontSize="9">
          solved
        </text>
      </svg>

      {/* Legend: dot + label + count */}
      <div className="pie-legend">
        {slices.map((s) => (
          <div key={s.label} className="pie-legend-row">
            <span className="pie-dot" style={{ background: s.color }} />
            <span className="pie-lbl">{s.label}</span>
            <span className="pie-val">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}