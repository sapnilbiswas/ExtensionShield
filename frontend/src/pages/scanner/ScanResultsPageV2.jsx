import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
  RiskGauge, 
  ScoreCard, 
  StatsPanel, 
  FactorBreakdown 
} from "../../components/dashboard";
import FileViewerModal from "../../components/FileViewerModal";
import StatusMessage from "../../components/StatusMessage";
import { useScan } from "../../context/ScanContext";
import realScanService from "../../services/realScanService";
import "./ScanResultsPageV2.scss";

/**
 * ScanResultsPageV2 - Redesigned results dashboard
 * Clean, Robinhood-inspired UI with visual risk indicators
 */
const ScanResultsPageV2 = () => {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const {
    scanResults,
    error,
    setError,
    loadResultsById,
    currentExtensionId,
  } = useScan();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [fileViewerModal, setFileViewerModal] = useState({
    isOpen: false,
    file: null,
  });

  // Load results if not already in context
  useEffect(() => {
    const loadResults = async () => {
      if (!scanResults || currentExtensionId !== scanId) {
        setIsLoading(true);
        await loadResultsById(scanId);
        setIsLoading(false);
      }
    };
    loadResults();
  }, [scanId, scanResults, currentExtensionId, loadResultsById]);

  const handleViewFile = (file) => {
    setFileViewerModal({ isOpen: true, file });
  };

  const getFileContent = async (extensionId, filePath) => {
    return await realScanService.getFileContent(extensionId, filePath);
  };

  // Extract scoring v2 data if available
  const scoringV2 = scanResults?.scoringV2 || scanResults?.scoring_v2 || null;
  
  // Compute scores (use v2 if available, fallback to legacy)
  const overallScore = scoringV2?.overall_score ?? scanResults?.securityScore ?? 0;
  const securityScore = scoringV2?.security_score ?? scanResults?.securityScore ?? 0;
  const privacyScore = scoringV2?.privacy_score ?? 70; // Default if not available
  const governanceScore = scoringV2?.governance_score ?? 80; // Default if not available
  const decision = scoringV2?.decision ?? (overallScore >= 60 ? 'ALLOW' : overallScore >= 30 ? 'NEEDS_REVIEW' : 'BLOCK');

  // Extract factors for breakdown
  const securityFactors = scoringV2?.security_layer?.factors || [
    { name: 'SAST', severity: 0.2, weight: 0.3, confidence: 0.9 },
    { name: 'VirusTotal', severity: 0.0, weight: 0.15, confidence: 1.0 },
    { name: 'Obfuscation', severity: 0.1, weight: 0.15, confidence: 0.8 },
    { name: 'Manifest', severity: 0.15, weight: 0.1, confidence: 0.9 },
    { name: 'ChromeStats', severity: 0.1, weight: 0.1, confidence: 0.6 },
    { name: 'Webstore', severity: 0.05, weight: 0.1, confidence: 0.8 },
    { name: 'Maintenance', severity: 0.0, weight: 0.1, confidence: 0.9 },
  ];

  const privacyFactors = scoringV2?.privacy_layer?.factors || [
    { name: 'PermissionsBaseline', severity: 0.3, weight: 0.25, confidence: 0.7 },
    { name: 'PermissionCombos', severity: 0.2, weight: 0.25, confidence: 0.8 },
    { name: 'NetworkExfil', severity: 0.1, weight: 0.35, confidence: 0.6 },
    { name: 'CaptureSignals', severity: 0.0, weight: 0.15, confidence: 0.9 },
  ];

  const governanceFactors = scoringV2?.governance_layer?.factors || [
    { name: 'ToSViolations', severity: 0.1, weight: 0.5, confidence: 0.7 },
    { name: 'Consistency', severity: 0.2, weight: 0.3, confidence: 0.8 },
    { name: 'DisclosureAlignment', severity: 0.1, weight: 0.2, confidence: 0.7 },
  ];

  // Key findings for quick view
  const getKeyFindings = () => {
    const findings = [];
    
    if (scanResults?.virustotalAnalysis?.total_malicious > 0) {
      findings.push({
        type: 'critical',
        icon: '🚨',
        title: 'Malware Detected',
        description: `${scanResults.virustotalAnalysis.total_malicious} antivirus engines flagged this extension`
      });
    }
    
    if (scanResults?.entropyAnalysis?.obfuscated_files > 0) {
      findings.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Obfuscated Code',
        description: `${scanResults.entropyAnalysis.obfuscated_files} files contain obfuscated code`
      });
    }
    
    const highRiskPerms = (scanResults?.permissions || []).filter(p => p.risk === 'HIGH');
    if (highRiskPerms.length > 0) {
      findings.push({
        type: 'warning',
        icon: '🔑',
        title: 'High-Risk Permissions',
        description: `${highRiskPerms.length} permissions require elevated access`
      });
    }
    
    if (findings.length === 0) {
      findings.push({
        type: 'success',
        icon: '✓',
        title: 'No Critical Issues',
        description: 'Extension passed all major security checks'
      });
    }
    
    return findings;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="results-v2">
        <div className="results-v2-loading">
          <div className="loading-pulse" />
          <h2>Analyzing Extension</h2>
          <p>Running security scans...</p>
          <code>{scanId}</code>
        </div>
      </div>
    );
  }

  // No results
  if (!scanResults && !isLoading) {
    return (
      <div className="results-v2">
        <div className="results-v2-empty">
          <div className="empty-icon">📋</div>
          <h2>No Results Found</h2>
          <p>This extension hasn't been scanned yet.</p>
          <div className="empty-actions">
            <Button onClick={() => navigate("/scanner")} variant="default">
              Start Scan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-v2">
      {/* Navigation Bar */}
      <nav className="results-v2-nav">
        <Link to="/scanner" className="nav-back">
          ← Back
        </Link>
        <div className="nav-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const baseURL = import.meta.env.VITE_API_URL || "";
              window.open(`${baseURL}/api/scan/report/${scanId}`, '_blank');
            }}
          >
            Export PDF
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/scanner")}
          >
            New Scan
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="results-v2-hero">
        <div className="hero-content">
          <div className="hero-info">
            {scanResults?.icon && (
              <img 
                src={scanResults.icon} 
                alt="" 
                className="hero-icon"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div className="hero-text">
              <h1 className="hero-title">{scanResults?.name || "Extension"}</h1>
              <div className="hero-meta">
                <code className="hero-id">{scanId}</code>
                {scanResults?.version && (
                  <Badge variant="outline">v{scanResults.version}</Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="hero-gauge">
            <RiskGauge 
              score={overallScore} 
              size={180}
              label="Overall Score"
              decision={decision}
            />
          </div>
        </div>
      </header>

      {/* Status Messages */}
      {error && (
        <StatusMessage
          type="error"
          message={error}
          onDismiss={() => setError("")}
        />
      )}

      {/* Main Content */}
      <main className="results-v2-main">
        {/* Score Cards Row */}
        <section className="scores-section">
          <ScoreCard 
            title="Security"
            score={securityScore}
            icon="🛡️"
            weight={0.5}
            accentColor="#3B82F6"
            factors={securityFactors}
          />
          <ScoreCard 
            title="Privacy"
            score={privacyScore}
            icon="🔒"
            weight={0.3}
            accentColor="#8B5CF6"
            factors={privacyFactors}
          />
          <ScoreCard 
            title="Governance"
            score={governanceScore}
            icon="📋"
            weight={0.2}
            accentColor="#10B981"
            factors={governanceFactors}
          />
        </section>

        {/* Key Findings */}
        <section className="findings-section">
          <h2 className="section-title">Key Findings</h2>
          <div className="findings-grid">
            {getKeyFindings().map((finding, idx) => (
              <div 
                key={idx} 
                className={`finding-card finding-card--${finding.type}`}
              >
                <span className="finding-icon">{finding.icon}</span>
                <div className="finding-content">
                  <h3 className="finding-title">{finding.title}</h3>
                  <p className="finding-description">{finding.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="results-v2-grid">
          {/* Left Column - Stats & Details */}
          <div className="results-v2-col">
            <StatsPanel 
              userCount={scanResults?.userCount}
              rating={scanResults?.rating}
              reviewCount={scanResults?.reviewCount}
              version={scanResults?.version}
              lastUpdated={scanResults?.lastUpdated}
              developer={scanResults?.developer}
              category={scanResults?.category}
            />
            
            {/* Permissions Summary */}
            <div className="permissions-panel">
              <h3 className="panel-title">Permissions</h3>
              <div className="permissions-list">
                {(scanResults?.permissions || []).slice(0, 6).map((perm, idx) => (
                  <div key={idx} className="permission-item">
                    <span className="permission-name">{perm.name}</span>
                    <Badge 
                      variant={perm.risk === 'HIGH' ? 'destructive' : perm.risk === 'MEDIUM' ? 'secondary' : 'outline'}
                      className="permission-risk"
                    >
                      {perm.risk}
                    </Badge>
                  </div>
                ))}
                {(scanResults?.permissions?.length || 0) > 6 && (
                  <div className="permissions-more">
                    +{scanResults.permissions.length - 6} more permissions
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Factor Breakdown */}
          <div className="results-v2-col">
            <FactorBreakdown 
              title="Security Factors"
              factors={securityFactors}
            />
            <FactorBreakdown 
              title="Privacy Factors"
              factors={privacyFactors}
            />
            <FactorBreakdown 
              title="Governance Factors"
              factors={governanceFactors}
            />
          </div>
        </div>

        {/* Executive Summary */}
        {scanResults?.executiveSummary && (
          <section className="summary-section">
            <h2 className="section-title">Executive Summary</h2>
            <div className="summary-card">
              <p>{scanResults.executiveSummary}</p>
            </div>
          </section>
        )}
      </main>

      {/* File Viewer Modal */}
      <FileViewerModal
        isOpen={fileViewerModal.isOpen}
        onClose={() => setFileViewerModal({ isOpen: false, file: null })}
        file={fileViewerModal.file}
        extensionId={scanResults?.extensionId || scanId}
        onGetFileContent={getFileContent}
      />

      {/* Footer */}
      <footer className="results-v2-footer">
        <p>
          Generated by ExtensionShield • Results should be reviewed by a security professional
        </p>
      </footer>
    </div>
  );
};

export default ScanResultsPageV2;

