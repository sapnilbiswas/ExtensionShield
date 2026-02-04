import React, { useState } from 'react';
import './FactorBreakdown.scss';

/**
 * FactorBreakdown - Visual breakdown of scoring factors
 * Shows each factor's contribution with animated bars
 */
const FactorBreakdown = ({ 
  title = 'Factor Breakdown',
  factors = [],
  showWeights = true,
  expandable = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getFactorIcon = (name) => {
    const icons = {
      'SAST': '🔍',
      'VirusTotal': '🛡️',
      'Obfuscation': '🔐',
      'Manifest': '📋',
      'ChromeStats': '📊',
      'Webstore': '🏪',
      'Maintenance': '🔧',
      'PermissionsBaseline': '🔑',
      'PermissionCombos': '⚠️',
      'NetworkExfil': '🌐',
      'CaptureSignals': '📸',
      'ToSViolations': '📜',
      'Consistency': '✓',
      'DisclosureAlignment': '📄'
    };
    return icons[name] || '•';
  };

  const getSeverityColor = (severity) => {
    if (severity >= 0.7) return '#EF4444'; // Red
    if (severity >= 0.4) return '#F59E0B'; // Yellow
    if (severity >= 0.1) return '#10B981'; // Green
    return '#6B7280'; // Gray (no risk)
  };

  const displayFactors = expandable && !isExpanded 
    ? factors.slice(0, 4) 
    : factors;

  return (
    <div className="factor-breakdown">
      <div className="factor-breakdown-header">
        <h4 className="factor-breakdown-title">{title}</h4>
        {showWeights && (
          <span className="factor-breakdown-subtitle">
            {factors.length} factors analyzed
          </span>
        )}
      </div>
      
      <div className="factor-list">
        {displayFactors.map((factor, idx) => (
          <div key={idx} className="factor-row">
            <div className="factor-info">
              <span className="factor-icon">{getFactorIcon(factor.name)}</span>
              <span className="factor-name">{factor.name}</span>
              {showWeights && (
                <span className="factor-weight">
                  {Math.round(factor.weight * 100)}%
                </span>
              )}
            </div>
            
            <div className="factor-bar-container">
              <div className="factor-bar-track">
                <div 
                  className="factor-bar-fill"
                  style={{ 
                    width: `${(1 - factor.severity) * 100}%`,
                    backgroundColor: getSeverityColor(factor.severity)
                  }}
                />
              </div>
              <span 
                className="factor-score"
                style={{ color: getSeverityColor(factor.severity) }}
              >
                {Math.round((1 - factor.severity) * 100)}
              </span>
            </div>
            
            {factor.flags && factor.flags.length > 0 && (
              <div className="factor-flags">
                {factor.flags.slice(0, 2).map((flag, i) => (
                  <span key={i} className="factor-flag">{flag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {expandable && factors.length > 4 && (
        <button 
          className="factor-expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show Less' : `Show ${factors.length - 4} More`}
        </button>
      )}
    </div>
  );
};

/**
 * FactorRing - Compact ring visualization of a single factor
 */
const FactorRing = ({ name, severity, size = 48 }) => {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = severity * circumference;
  
  const color = severity >= 0.7 ? '#EF4444' 
    : severity >= 0.4 ? '#F59E0B' 
    : severity >= 0.1 ? '#10B981' 
    : '#6B7280';

  return (
    <div className="factor-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="factor-ring-label" style={{ fontSize: size * 0.2 }}>
        {Math.round((1 - severity) * 100)}
      </span>
    </div>
  );
};

export { FactorRing };
export default FactorBreakdown;

