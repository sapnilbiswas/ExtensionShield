import React from 'react';
import './SummaryPanel.scss';
import { normalizeHighlights } from '../../utils/normalizeScanResult';

/**
 * SummaryPanel - Consumer-friendly summary following the format:
 * 
 * 1) Verdict line (max 12 words)
 * 2) 2-3 bullet reasons (plain English)
 * 3) 1 bullet "What it can access"
 * 4) 1 bullet "What to do"
 * Total: <= 80 words
 * 
 * Data sources (priority order):
 * A. consumer_summary from report_view_model (new format)
 * B. Fallback to legacy normalizeHighlights
 */
const SummaryPanel = ({ 
  scores = {},
  factorsByLayer = {},
  rawScanResult = null,
  keyFindings = [],
  onViewEvidence = null
}) => {
  // Try new consumer_summary format first
  const consumerSummary = rawScanResult?.report_view_model?.consumer_summary;
  
  // Fallback to legacy highlights
  const { oneLiner, keyPoints, whatToWatch } = normalizeHighlights(rawScanResult);

  // Use consumer summary if available, otherwise legacy format
  const hasConsumerSummary = consumerSummary && consumerSummary.verdict;
  const hasLegacy = oneLiner || keyPoints.length > 0;

  if (!hasConsumerSummary && !hasLegacy) {
    return null;
  }

  const getDecisionBadge = () => {
    const decision = scores?.decision;
    if (!decision) return null;

    const badges = {
      'ALLOW': { label: 'Safe', color: '#10B981', icon: '✓' },
      'WARN': { label: 'Review', color: '#F59E0B', icon: '⚡' },
      'BLOCK': { label: 'Blocked', color: '#EF4444', icon: '✕' },
    };

    const badge = badges[decision] || badges['WARN'];
    return (
      <span 
        className="decision-badge"
        style={{ backgroundColor: badge.color }}
      >
        <span className="badge-icon">{badge.icon}</span>
        <span className="badge-text">{badge.label}</span>
      </span>
    );
  };

  // New consumer-friendly layout
  if (hasConsumerSummary) {
    const { verdict, reasons = [], access, action } = consumerSummary;

    return (
      <section className="summary-panel">
        <div className="summary-header">
          <h2 className="summary-title">
            <span className="title-icon">✨</span>
            Quick Summary
          </h2>
          {getDecisionBadge()}
        </div>

        <div className="summary-content">
          {/* Verdict - the headline */}
          {verdict && (
            <div className="summary-verdict-wrapper">
              <p className="summary-verdict">{verdict}</p>
            </div>
          )}

          {/* Reasons - why this score */}
          {reasons.length > 0 && (
            <div className="summary-section key-reasons">
              <h3 className="section-subtitle">
                <span className="subtitle-icon">📌</span>
                Why This Score
              </h3>
              <div className="reasons-list">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="reason-card">
                    <span className="reason-number">{idx + 1}</span>
                    <p className="reason-text">{reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Access - what it can access */}
          {access && (
            <div className="summary-section access-section">
              <h3 className="section-subtitle">
                <span className="subtitle-icon">🔑</span>
                What It Can Access
              </h3>
              <div className="access-card">
                <span className="access-text">{access}</span>
              </div>
            </div>
          )}

          {/* Action - what to do */}
          {action && (
            <div className="summary-section action-section">
              <h3 className="section-subtitle">
                <span className="subtitle-icon">👉</span>
                What to Do
              </h3>
              <div className="action-card">
                <span className="action-text">{action}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Legacy layout (fallback when consumer_summary is not available)
  return (
    <section className="summary-panel">
      <div className="summary-header">
        <h2 className="summary-title">
          <span className="title-icon">✨</span>
          Quick Summary
        </h2>
        {getDecisionBadge()}
      </div>

      <div className="summary-content">
        {/* One-liner summary */}
        {oneLiner && (
          <div className="summary-verdict-wrapper">
            <p className="summary-verdict">{oneLiner}</p>
          </div>
        )}

        {/* Key Points */}
        {keyPoints.length > 0 && (
          <div className="summary-section key-reasons">
            <h3 className="section-subtitle">
              <span className="subtitle-icon">📌</span>
              Why This Score
            </h3>
            <div className="reasons-list">
              {keyPoints.map((point, idx) => (
                <div key={idx} className="reason-card">
                  <span className="reason-number">{idx + 1}</span>
                  <p className="reason-text">{point}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What to Watch */}
        {whatToWatch.length > 0 && (
          <div className="summary-section action-section">
            <h3 className="section-subtitle">
              <span className="subtitle-icon">👁️</span>
              What to Watch
            </h3>
            <div className="watch-items">
              {whatToWatch.map((item, idx) => (
                <div key={idx} className="action-card">
                  <span className="watch-icon">⚠️</span>
                  <span className="action-text">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SummaryPanel;
