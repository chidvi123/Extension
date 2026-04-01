import React from "react";

// Props:
//   easy   {number}
//   medium {number}
//   hard   {number}

export default function PieChart({ easy, medium, hard }) {
  const total = easy + medium + hard || 1;

  const slices = [
    { label: "Easy",   value: easy,   color: "#10b981" },
    { label: "Medium", value: medium, color: "#f59e0b" },
    { label: "Hard",   value: hard,   color: "#ef4444" },
  ];

  let cum = -Math.PI / 2;
  const cx = 56, cy = 56, r = 46;

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
      <svg width="112" height="112" viewBox="0 0 112 112">
        {total === 1
          ? <circle cx={cx} cy={cy} r={r} fill="var(--track)" />
          : paths.map((p) => (
              <path
                key={p.label}
                d={p.d}
                fill={p.color}
                stroke="var(--card)"
                strokeWidth="1.5"
              />
            ))
        }
        {/* Donut hole */}
        <circle cx={cx} cy={cy} r={26} fill="var(--card)" />
        {/* Center text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="var(--text)" fontSize="14" fontWeight="700">
          {easy + medium + hard}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text3)" fontSize="8">
          solved
        </text>
      </svg>

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