import React from 'react';
import './ScoreCard.scss';

/**
 * ScoreCard - Clean layer score display with mini progress bar
 * Shows Security, Privacy, or Governance scores
 */
const ScoreCard = ({ 
  title, 
  score = 0, 
  icon,
  factors = [],
  weight = 0,
  accentColor = '#3B82F6',
  onClick
}) => {
  const getScoreStatus = (value) => {
    if (value >= 70) return { label: 'Good', color: '#10B981' };
    if (value >= 50) return { label: 'Fair', color: '#F59E0B' };
    if (value >= 30) return { label: 'Poor', color: '#F97316' };
    return { label: 'Critical', color: '#EF4444' };
  };

  const status = getScoreStatus(score);

  return (
    <div 
      className="score-card" 
      onClick={onClick}
      style={{ '--accent-color': accentColor }}
    >
      <div className="score-card-header">
        <div className="score-card-icon">
          {icon}
        </div>
        <div className="score-card-meta">
          <span className="score-card-title">{title}</span>
          <span className="score-card-weight">{Math.round(weight * 100)}% weight</span>
        </div>
      </div>
      
      <div className="score-card-value">
        <span className="score-number" style={{ color: status.color }}>
          {score}
        </span>
        <span className="score-max">/100</span>
      </div>
      
      <div className="score-card-progress">
        <div 
          className="progress-fill" 
          style={{ 
            width: `${score}%`,
            backgroundColor: status.color
          }}
        />
      </div>
      
      <div className="score-card-status" style={{ color: status.color }}>
        {status.label}
      </div>
      
      {factors.length > 0 && (
        <div className="score-card-factors">
          {factors.slice(0, 3).map((factor, idx) => (
            <div key={idx} className="factor-pill">
              <span className="factor-name">{factor.name}</span>
              <span 
                className="factor-severity"
                style={{ 
                  backgroundColor: factor.severity > 0.5 
                    ? 'rgba(239, 68, 68, 0.2)' 
                    : factor.severity > 0.2 
                      ? 'rgba(245, 158, 11, 0.2)' 
                      : 'rgba(16, 185, 129, 0.2)',
                  color: factor.severity > 0.5 
                    ? '#EF4444' 
                    : factor.severity > 0.2 
                      ? '#F59E0B' 
                      : '#10B981'
                }}
              >
                {Math.round((1 - factor.severity) * 100)}%
              </span>
            </div>
          ))}
          {factors.length > 3 && (
            <div className="factor-more">+{factors.length - 3} more</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreCard;

