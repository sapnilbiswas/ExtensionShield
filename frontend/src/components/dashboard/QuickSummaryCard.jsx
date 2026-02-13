import React from "react";

const QuickSummaryCard = ({
  headline,
  body,
  primaryAction,
  secondaryAction,
  badgeLabel,
  delay = 0
}) => {
  return (
    <section className="quick-summary-card" style={{ animationDelay: `${delay}s` }}>
      <header className="quick-summary-header">
        <div>
          <p className="quick-summary-label">✨ Quick Summary</p>
          <h3 className="quick-summary-headline">{headline}</h3>
        </div>
        {badgeLabel && <span className="quick-summary-badge">{badgeLabel}</span>}
      </header>

      <p className="quick-summary-body">{body}</p>

      <div className="quick-summary-actions">
        <button
          type="button"
          className="quick-summary-btn"
          onClick={primaryAction?.onClick}
        >
          {primaryAction?.label}
        </button>
        <button
          type="button"
          className="quick-summary-btn secondary"
          onClick={secondaryAction?.onClick}
        >
          {secondaryAction?.label}
        </button>
      </div>
    </section>
  );
};

export default QuickSummaryCard;
