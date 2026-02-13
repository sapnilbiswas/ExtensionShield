import React, { useEffect, useState } from "react";

const ExtensionHeaderCard = ({
  iconLabel,
  name,
  title,
  metadata = [],
  tag,
  score,
  gaugeLabel,
  delay = 0
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let raf;
    let start;
    const duration = 1100;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setAnimatedScore(progress * score);
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const gaugeDegrees = (animatedScore / 100) * 360;

  return (
    <article className="extension-header-card" style={{ animationDelay: `${delay}s` }}>
      <div className="extension-card-content">
        <div className="extension-card-left">
          <div className="extension-card-icon" aria-hidden="true">
            {iconLabel}
          </div>
          <div>
            <p className="extension-card-title">{title}</p>
            <h2 className="extension-card-name">{name}</h2>
          </div>
        </div>

        <div className="extension-card-gauge">
          <div
            className="extension-card-gauge-ring"
            style={{ "--gauge-score": `${gaugeDegrees}deg` }}
          >
            <div className="extension-card-gauge-inner">
              <span className="extension-card-score">
                {Math.round(animatedScore || 0)}
              </span>
              <span className="extension-card-gauge-label">{gaugeLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="extension-card-meta">
        {metadata.map((item, index) => (
          <span key={`${item}-${index}`} className="extension-meta-tag">
            {item}
          </span>
        ))}
        {tag && (
          <span className="extension-meta-pill">
            {tag}
          </span>
        )}
      </div>
    </article>
  );
};

export default ExtensionHeaderCard;
