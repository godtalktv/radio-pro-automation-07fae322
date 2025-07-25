import React from 'react';

const TYPE_COLORS = {
  music: '#3b82f6', // blue-500
  station_id: '#8b5cf6', // violet-500
  commercial: '#22c55e', // green-500
  promo: '#f97316', // orange-500
  jingle: '#eab308', // yellow-500
  sweeper: '#ec4899', // pink-500
  default: '#6b7280', // gray-500
};

// Helper function to get coordinates for a point on a circle
const getCoords = (minutes, radius, cx, cy) => {
  // Convert minutes to angle (0 minutes = top of clock = -90 degrees)
  const angle = (minutes / 60) * 2 * Math.PI - Math.PI / 2;
  const x = cx + radius * Math.cos(angle);
  const y = cy + radius * Math.sin(angle);
  return [x, y];
};

export default function ClockwheelVisualizer({ items = [] }) {
  const radius = 85;
  const cx = 110;
  const cy = 110;

  // Calculate total duration to see if we're close to 60 minutes
  const totalDuration = items.reduce((sum, item) => sum + (item.estimated_duration || 0), 0);
  const totalMinutes = Math.round(totalDuration / 60);

  let accumulatedMinutes = 0;

  const segments = items.map((item, index) => {
    const durationSeconds = item.estimated_duration || 180; // Default to 3 mins
    const durationMinutes = durationSeconds / 60;

    const startCoords = getCoords(accumulatedMinutes, radius, cx, cy);
    accumulatedMinutes += durationMinutes;
    const endCoords = getCoords(accumulatedMinutes, radius, cx, cy);

    const arcSize = durationMinutes / 60;
    const largeArcFlag = arcSize > 0.5 ? 1 : 0;
    const color = TYPE_COLORS[item.type] || TYPE_COLORS.default;

    const pathData = [
      `M ${cx} ${cy}`, // Move to center
      `L ${startCoords[0]} ${startCoords[1]}`, // Line to start of arc
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endCoords[0]} ${endCoords[1]}`, // Arc to end
      'Z', // Close path
    ].join(' ');

    // Calculate position for the segment number label
    const midMinutes = accumulatedMinutes - durationMinutes / 2;
    const labelAngle = (midMinutes / 60) * 2 * Math.PI - Math.PI / 2;
    const labelRadius = radius * 0.7;
    const labelX = cx + labelRadius * Math.cos(labelAngle);
    const labelY = cy + labelRadius * Math.sin(labelAngle);

    return {
        path: pathData,
        color: color,
        label: `${index + 1}`,
        labelX,
        labelY,
        type: item.type,
        duration: Math.round(durationMinutes)
    };
  });

  // Generate hour markers (12, 3, 6, 9 o'clock positions)
  const hourMarkers = [
    { minutes: 0, label: ':00', position: 'top-2' },
    { minutes: 15, label: ':15', position: 'right-2' },
    { minutes: 30, label: ':30', position: 'bottom-2' },
    { minutes: 45, label: ':45', position: 'left-2' }
  ];
  
  if (items.length === 0) {
      return (
          <div className="w-64 h-64 relative flex items-center justify-center">
              <svg viewBox="0 0 220 220" className="w-full h-full">
                  {/* Empty clock face */}
                  <circle cx="110" cy="110" r="85" fill="none" stroke="#4b5563" strokeWidth="2" strokeDasharray="4 8" />
                  
                  {/* Hour markers on empty clock */}
                  {hourMarkers.map((marker, i) => {
                    const coords = getCoords(marker.minutes, 95, cx, cy);
                    return (
                      <text key={i} x={coords[0]} y={coords[1]} textAnchor="middle" dominantBaseline="central" fill="#6b7280" fontSize="10">
                        {marker.label}
                      </text>
                    );
                  })}
                  
                  <circle cx="110" cy="110" r="15" fill="#1f2937" />
                  <text x="110" y="115" textAnchor="middle" fill="#6b7280" fontSize="12">
                      Empty
                  </text>
              </svg>
              <div className="absolute bottom-4 text-xs text-slate-500 text-center">
                  60-Minute Hour Clock
              </div>
          </div>
      )
  }

  return (
    <div className="w-64 h-64 relative">
      <svg viewBox="0 0 220 220" className="w-full h-full">
        {/* Clock segments */}
        {segments.map((segment, index) => (
          <g key={index}>
            <path
              d={segment.path}
              fill={segment.color}
              stroke="#1f2937"
              strokeWidth="2"
              opacity="0.8"
            >
              <title>{`${index + 1}. ${segment.type} (${segment.duration}min)`}</title>
            </path>
          </g>
        ))}
        
        {/* Hour markers */}
        {hourMarkers.map((marker, i) => {
          const coords = getCoords(marker.minutes, 95, cx, cy);
          return (
            <text key={i} x={coords[0]} y={coords[1]} textAnchor="middle" dominantBaseline="central" fill="#e2e8f0" fontSize="10" fontWeight="bold">
              {marker.label}
            </text>
          );
        })}
        
        {/* Minute tick marks every 5 minutes */}
        {[...Array(12)].map((_, i) => {
          const minutes = i * 5;
          const coords = getCoords(minutes, 85, cx, cy);
          const outerCoords = getCoords(minutes, 90, cx, cy);
          return (
            <line 
              key={`tick-${i}`} 
              x1={coords[0]} 
              y1={coords[1]} 
              x2={outerCoords[0]} 
              y2={outerCoords[1]} 
              stroke="#6b7280" 
              strokeWidth="1"
            />
          );
        })}
         
        {/* Center circle */}
        <circle cx="110" cy="110" r="15" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
        
        {/* Segment number labels */}
        {segments.map((segment, index) => (
           <text
              key={`label-${index}`}
              x={segment.labelX}
              y={segment.labelY}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="12"
              fontWeight="bold"
              style={{ pointerEvents: 'none' }}
           >
              {segment.label}
           </text>
        ))}
        
        {/* Center hour indicator */}
        <text x="110" y="115" textAnchor="middle" dominantBaseline="central" fill="#e2e8f0" fontSize="10" fontWeight="bold">
          1HR
        </text>
      </svg>
      
      {/* Status indicator */}
      <div className="absolute bottom-1 left-0 right-0 text-center">
        <div className="text-xs text-slate-400">
          Total: {totalMinutes} minutes
        </div>
        {totalMinutes < 58 && (
          <div className="text-xs text-yellow-400">
            ⚠️ {60 - totalMinutes} min short
          </div>
        )}
        {totalMinutes > 62 && (
          <div className="text-xs text-red-400">
            ⚠️ {totalMinutes - 60} min over
          </div>
        )}
        {totalMinutes >= 58 && totalMinutes <= 62 && (
          <div className="text-xs text-green-400">
            ✓ Perfect timing
          </div>
        )}
      </div>
    </div>
  );
}