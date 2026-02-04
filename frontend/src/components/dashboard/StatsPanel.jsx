import React from 'react';
import './StatsPanel.scss';

/**
 * StatItem - Individual statistic with optional trend indicator
 */
const StatItem = ({ 
  label, 
  value, 
  subtext,
  trend,
  icon,
  variant = 'default' 
}) => {
  const getTrendColor = (t) => {
    if (t > 0) return '#10B981';
    if (t < 0) return '#EF4444';
    return 'rgba(255, 255, 255, 0.5)';
  };

  return (
    <div className={`stat-item stat-item--${variant}`}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">
          {value}
          {trend !== undefined && (
            <span 
              className="stat-trend" 
              style={{ color: getTrendColor(trend) }}
            >
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '–'} 
              {trend !== 0 && `${Math.abs(trend)}%`}
            </span>
          )}
        </div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
    </div>
  );
};

/**
 * MiniSparkline - Simple SVG sparkline chart
 */
const MiniSparkline = ({ data = [], color = '#3B82F6', height = 40 }) => {
  if (!data || data.length < 2) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const width = 100;
  const padding = 2;
  const stepX = (width - padding * 2) / (data.length - 1);
  
  const points = data.map((value, i) => {
    const x = padding + i * stepX;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');
  
  const fillPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <svg 
      viewBox={`0 0 ${width} ${height}`} 
      className="mini-sparkline"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon 
        points={fillPoints} 
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
      <polyline 
        points={points} 
        fill="none" 
        stroke={color} 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * StatsPanel - Extension statistics overview
 */
const StatsPanel = ({ 
  userCount,
  rating,
  reviewCount,
  weeklyDownloads,
  lastUpdated,
  version,
  developer,
  category
}) => {
  // Format large numbers
  const formatNumber = (num) => {
    if (!num) return '–';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Mock sparkline data (in real implementation, this would come from API)
  const downloadTrend = [12, 15, 18, 14, 22, 25, 28];
  const ratingTrend = [4.2, 4.3, 4.2, 4.4, 4.3, 4.5, rating || 4.0];

  return (
    <div className="stats-panel">
      <div className="stats-header">
        <h3 className="stats-title">Extension Stats</h3>
        <span className="stats-category">{category || 'Productivity'}</span>
      </div>
      
      <div className="stats-grid">
        {/* Users */}
        <div className="stat-card stat-card--featured">
          <div className="stat-card-top">
            <span className="stat-card-label">Active Users</span>
            <span className="stat-card-icon">👥</span>
          </div>
          <div className="stat-card-value">{formatNumber(userCount)}</div>
          <MiniSparkline data={downloadTrend} color="#10B981" />
        </div>
        
        {/* Rating */}
        <div className="stat-card stat-card--featured">
          <div className="stat-card-top">
            <span className="stat-card-label">Rating</span>
            <span className="stat-card-icon">⭐</span>
          </div>
          <div className="stat-card-value">
            {rating ? rating.toFixed(1) : '–'}
            <span className="stat-card-suffix">/5</span>
          </div>
          <MiniSparkline data={ratingTrend} color="#F59E0B" />
        </div>
        
        {/* Reviews */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Reviews</span>
            <span className="stat-card-icon">💬</span>
          </div>
          <div className="stat-card-value">{formatNumber(reviewCount)}</div>
        </div>
        
        {/* Version */}
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-card-label">Version</span>
            <span className="stat-card-icon">📦</span>
          </div>
          <div className="stat-card-value stat-card-value--small">{version || '–'}</div>
        </div>
      </div>
      
      <div className="stats-footer">
        <div className="stats-meta">
          <span className="meta-label">Developer:</span>
          <span className="meta-value">{developer || 'Unknown'}</span>
        </div>
        <div className="stats-meta">
          <span className="meta-label">Updated:</span>
          <span className="meta-value">{lastUpdated || 'Unknown'}</span>
        </div>
      </div>
    </div>
  );
};

export { StatItem, MiniSparkline };
export default StatsPanel;

