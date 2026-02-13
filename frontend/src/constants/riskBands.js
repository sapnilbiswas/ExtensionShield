/**
 * Risk rating criteria (aligned with backend scoring/models.py and normalizeScanResult.ts)
 * Used by DonutScore, sidebar tiles, and any UI that shows red/amber/green bands.
 *
 * Red (BAD):    0–59  — High risk
 * Amber (WARN): 60–84 — Needs review / medium risk
 * Green (GOOD): 85–100 — Low risk
 */
export const RISK_BAND_THRESHOLDS = {
  BAD:  { min: 0,  max: 59,  label: 'High risk',   color: '#EF4444' },
  WARN: { min: 60, max: 84,  label: 'Needs review', color: '#F5A524' },
  GOOD: { min: 85, max: 100, label: 'Low risk',     color: '#39D98A' },
};

export const getBandFromScore = (score) => {
  if (score == null) return 'NA';
  if (score >= RISK_BAND_THRESHOLDS.GOOD.min) return 'GOOD';
  if (score >= RISK_BAND_THRESHOLDS.WARN.min) return 'WARN';
  return 'BAD';
};
