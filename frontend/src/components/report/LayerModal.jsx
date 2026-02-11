import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import './LayerModal.scss';

// ---------------------------------------------------------------------------
// Human-readable translations for internal factor names
// ---------------------------------------------------------------------------
const FACTOR_HUMAN = {
  // Security layer
  SAST:                 { label: 'Code Safety',           icon: '🔍', category: 'code',   desc: 'Static analysis of extension source code' },
  VirusTotal:           { label: 'Malware Scan',          icon: '🦠', category: 'threat', desc: 'Malware detection across 70+ antivirus engines' },
  Obfuscation:          { label: 'Hidden Code',           icon: '🫣', category: 'code',   desc: 'Code that is intentionally hard to read' },
  Manifest:             { label: 'Extension Config',      icon: '⚙️', category: 'code',   desc: 'Security posture of the extension manifest' },
  ChromeStats:          { label: 'Threat Intelligence',   icon: '📡', category: 'threat', desc: 'Behavioral signals from Chrome threat feeds' },
  Webstore:             { label: 'Store Reputation',      icon: '🏪', category: 'trust',  desc: 'Webstore listing signals and reputation' },
  Maintenance:          { label: 'Update Freshness',      icon: '📅', category: 'trust',  desc: 'How recently the extension was updated' },
  // Privacy layer
  PermissionsBaseline:  { label: 'Permission Risk',       icon: '🔑', category: 'access', desc: 'Individual permission risk assessment' },
  PermissionCombos:     { label: 'Dangerous Combos',      icon: '⚡', category: 'access', desc: 'Risky combinations of permissions together' },
  NetworkExfil:         { label: 'Data Sharing',           icon: '📤', category: 'data',   desc: 'Potential for sending your data externally' },
  CaptureSignals:       { label: 'Screen / Tab Capture',  icon: '📹', category: 'data',   desc: 'Can record your screen, tabs, or desktop' },
  // Governance layer
  ToSViolations:        { label: 'Policy Violations',     icon: '📜', category: 'policy', desc: 'Chrome Web Store Terms of Service compliance' },
  Consistency:          { label: 'Behavior Match',        icon: '🎯', category: 'policy', desc: 'Does what it claims match what it does?' },
  DisclosureAlignment:  { label: 'Disclosure Accuracy',   icon: '📋', category: 'policy', desc: 'Privacy policy vs actual data practices' },
};

const CATEGORY_LABELS = {
  code:   'Code Analysis',
  threat: 'Threat Detection',
  trust:  'Trust Signals',
  access: 'Data Access',
  data:   'Data Handling',
  policy: 'Policy Compliance',
};

const LAYER_CONFIG = {
  security: {
    title: 'Security',
    icon: '🛡️',
    tagline: 'How safe is the code and configuration?',
  },
  privacy: {
    title: 'Privacy',
    icon: '🔒',
    tagline: 'What data can it access and where does it go?',
  },
  governance: {
    title: 'Governance',
    icon: '📋',
    tagline: 'Does it follow the rules and do what it claims?',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function humanizeFactor(factor) {
  const info = FACTOR_HUMAN[factor.name] || {
    label: factor.name,
    icon: '📊',
    category: 'other',
    desc: '',
  };
  const severity = factor.severity ?? 0;
  let level, levelColor;
  if (severity >= 0.7)      { level = 'High risk';   levelColor = '#EF4444'; }
  else if (severity >= 0.4) { level = 'Medium risk';  levelColor = '#F59E0B'; }
  else if (severity >= 0.05){ level = 'Low risk';     levelColor = '#10B981'; }
  else                      { level = 'Clear';        levelColor = '#10B981'; }
  return { ...info, level, levelColor, severity, raw: factor };
}

function groupByCategory(items) {
  const groups = {};
  items.forEach(item => {
    const cat = item.category || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });
  // Sort each group: highest severity first
  Object.values(groups).forEach(g => g.sort((a, b) => b.severity - a.severity));
  // Return as array of [category, items[]], sorted by max severity descending
  return Object.entries(groups)
    .sort(([, a], [, b]) => Math.max(...b.map(x => x.severity)) - Math.max(...a.map(x => x.severity)));
}

function bandColor(band) {
  switch (band) {
    case 'GOOD': return '#10B981';
    case 'WARN': return '#F59E0B';
    case 'BAD':  return '#EF4444';
    default:     return '#6B7280';
  }
}

function bandLabel(band) {
  switch (band) {
    case 'GOOD': return 'Good';
    case 'WARN': return 'Caution';
    case 'BAD':  return 'Bad';
    default:     return '';
  }
}

// Human-friendly permission name
function humanizePermission(perm) {
  const MAP = {
    'tabs':             'See your open tabs',
    'cookies':          'Read your cookies',
    'history':          'Read your browsing history',
    'webNavigation':    'See every page you visit',
    'webRequest':       'Intercept network requests',
    'webRequestBlocking': 'Block / modify network requests',
    'clipboardRead':    'Read your clipboard',
    'clipboardWrite':   'Write to your clipboard',
    'management':       'Manage other extensions',
    'nativeMessaging':  'Talk to apps on your computer',
    'debugger':         'Full debugger access',
    'desktopCapture':   'Record your desktop',
    'tabCapture':       'Record a browser tab',
    'proxy':            'Route your traffic through a proxy',
    '<all_urls>':       'Access all websites',
    'geolocation':      'Read your location',
    'notifications':    'Send you notifications',
    'storage':          'Store data locally',
    'activeTab':        'Access the page you are viewing',
    'alarms':           'Set background timers',
    'contextMenus':     'Add right-click menu items',
    'identity':         'Access your Google account info',
    'scripting':        'Run scripts on pages you visit',
  };
  // URL patterns
  if (perm.includes('://*/*') || perm === '<all_urls>') {
    return 'Access all websites';
  }
  if (perm.match(/^https?:\/\//)) {
    try {
      const hostname = new URL(perm.replace(/\*/g, 'x')).hostname.replace(/^x\./, '*.');
      return `Access ${hostname}`;
    } catch { /* fall through */ }
  }
  return MAP[perm] || perm;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const LayerModal = ({
  open,
  onClose,
  layer,
  score = null,
  band = 'NA',
  factors = [],
  permissions = null,
  powerfulPermissions = [],
  keyFindings = [],
  gateResults = [],
  layerReasons = [],
  layerDetails = null,
  onViewEvidence = null,
}) => {
  const config = LAYER_CONFIG[layer] || LAYER_CONFIG.security;
  const displayScore = score === null ? '--' : Math.round(score);
  const bc = bandColor(band);
  const bl = bandLabel(band);

  // LLM plain-language content
  const ld = layerDetails?.[layer] || {};
  const oneLiner = ld.one_liner || '';
  const keyPoints = (ld.key_points || []).filter(p => p?.trim());
  const whatToWatch = (ld.what_to_watch || []).filter(p => p?.trim());

  // Categorised & humanised factors
  const humanised = factors.map(humanizeFactor);
  const grouped = groupByCategory(humanised);

  // Build a flat permissions list for display
  const permsList = buildPermsList(layer, permissions, powerfulPermissions);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="lm-content">
        <DialogHeader>
          <DialogTitle className="lm-header">
            <span className="lm-icon">{config.icon}</span>
            <span className="lm-title">{config.title}</span>
            <div className="lm-score-area">
              <span className="lm-score" style={{ color: bc }}>
                {score !== null ? `${displayScore}/100` : displayScore}
              </span>
              {bl && <span className="lm-band" style={{ color: bc }}>{bl}</span>}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="lm-body">
          {/* One-liner insight */}
          {oneLiner ? (
            <p className="lm-insight">{oneLiner}</p>
          ) : (
            <p className="lm-tagline">{config.tagline}</p>
          )}

          {/* Key Findings (plain English) */}
          {keyPoints.length > 0 && (
            <div className="lm-section">
              <h3 className="lm-section-title">Key Findings</h3>
              <ul className="lm-bullets">
                {keyPoints.map((pt, i) => (
                  <li key={i}><span className="lm-bullet-num">{i + 1}</span>{pt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Breakdown - grouped by category */}
          {grouped.length > 0 && (
            <div className="lm-section">
              <h3 className="lm-section-title">Risk Breakdown</h3>
              <div className="lm-categories">
                {grouped.map(([cat, items]) => (
                  <div key={cat} className="lm-cat">
                    <span className="lm-cat-label">{CATEGORY_LABELS[cat] || cat}</span>
                    <div className="lm-cat-items">
                      {items.map((item, idx) => (
                        <div key={idx} className="lm-factor">
                          <span className="lm-factor-icon">{item.icon}</span>
                          <div className="lm-factor-info">
                            <span className="lm-factor-label">{item.label}</span>
                            {item.desc && <span className="lm-factor-desc">{item.desc}</span>}
                          </div>
                          <span className="lm-factor-level" style={{ color: item.levelColor }}>
                            {item.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Permissions - flat list with human labels */}
          {permsList.length > 0 && (
            <div className="lm-section">
              <h3 className="lm-section-title">What It Can Do</h3>
              <ul className="lm-perms-list">
                {permsList.map((p, i) => (
                  <li key={i} className={`lm-perm lm-perm-${p.risk}`}>
                    <span className="lm-perm-dot" />
                    <span className="lm-perm-text">{p.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What to Watch */}
          {whatToWatch.length > 0 && (
            <div className="lm-section">
              <h3 className="lm-section-title">What to Watch</h3>
              <ul className="lm-watch">
                {whatToWatch.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Build a flat, deduplicated, sorted permissions list
// ---------------------------------------------------------------------------
function buildPermsList(layer, permissions, powerfulPermissions) {
  const seen = new Set();
  const list = [];

  const addPerm = (name, risk) => {
    const label = humanizePermission(name);
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    list.push({ label, risk });
  };

  // High-risk first
  if (layer === 'security' && powerfulPermissions.length > 0) {
    powerfulPermissions.forEach(p => addPerm(p, 'high'));
  }

  if (permissions) {
    (permissions.highRiskPermissions || []).forEach(p => addPerm(p, 'high'));
    (permissions.broadHostPatterns || []).forEach(p => addPerm(p, 'high'));
    (permissions.unreasonablePermissions || []).forEach(p => addPerm(p, 'medium'));
    (permissions.apiPermissions || []).forEach(p => addPerm(p, 'low'));
    (permissions.hostPermissions || []).forEach(p => addPerm(p, 'low'));
  }

  // Sort: high -> medium -> low, cap at 12
  const riskOrder = { high: 0, medium: 1, low: 2 };
  list.sort((a, b) => (riskOrder[a.risk] ?? 3) - (riskOrder[b.risk] ?? 3));
  return list.slice(0, 12);
}

export default LayerModal;
