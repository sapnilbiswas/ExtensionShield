import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useScan } from "../../context/ScanContext";
import { EXTENSION_ICON_PLACEHOLDER, getExtensionIconUrl } from "../../utils/constants";
import realScanService from "../../services/realScanService";
import { getScanResultsRoute } from "../../utils/slug";
import ScanHUD from "../../components/ScanHUD";
import SEOHead from "../../components/SEOHead";
import { normalizeExtensionId } from "../../utils/extensionId";
import { logger } from "../../utils/logger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import "./ScanProgressPage.scss";

const ScanProgressPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Read scanId from any possible param key (scanId, extensionId, id)
  const rawScanId = params.scanId || params.extensionId || params.id || '';
  
  // Use Chrome extension ID (32 a-p) or upload scan ID (UUID) from URL
  // normalizeExtensionId now handles both formats
  const scanId = normalizeExtensionId(rawScanId) || rawScanId;
  
  // Dev-only logging
  useEffect(() => {
    if (import.meta.env.DEV) {
      logger.log("[ScanProgressPage] Params:", params);
      logger.log("[ScanProgressPage] Raw scanId:", rawScanId);
      logger.log("[ScanProgressPage] Normalized scanId:", scanId);
    }
  }, [params, rawScanId, scanId]);
  const {
    isScanning,
    scanStage,
    error,
    setError,
    scanResults,
    setScanResults,
    setCurrentExtensionId,
    currentExtensionId,
  } = useScan();
  
  const [extensionLogo, setExtensionLogo] = useState(EXTENSION_ICON_PLACEHOLDER);
  const [extensionName, setExtensionName] = useState(null);
  const [scanComplete, setScanComplete] = useState(false);
  const [alreadyScanned, setAlreadyScanned] = useState(false);
  // Initialize userExited to false - always start with game visible when scanId exists
  const [userExited, setUserExited] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const completionShownRef = useRef(false);
  // Tracks whether any in-progress state was seen before completion.
  // If the first poll returns scanned=true, the extension was already scanned.
  const hasSeenInProgressRef = useRef(false);
  
  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch extension logo and name with error handling
  useEffect(() => {
    if (!scanId) return;
    let cancelled = false;
    
    const iconUrl = getExtensionIconUrl(scanId);
    
    // Try to load the icon with error handling
    try {
      const img = new Image();
      img.onload = () => {
        if (!cancelled) setExtensionLogo(iconUrl);
      };
      img.onerror = () => {
        if (!cancelled) setExtensionLogo(EXTENSION_ICON_PLACEHOLDER);
      };
      img.src = iconUrl;
    } catch (err) {
      // Silently fail - use placeholder
      if (!cancelled) setExtensionLogo(EXTENSION_ICON_PLACEHOLDER);
    }

    // Try to fetch extension name from scan results
    const fetchExtensionInfo = async () => {
      try {
        const results = await realScanService.getRealScanResults(scanId);
        if (cancelled) return;
        if (results?.extension_name) {
          setExtensionName(results.extension_name);
        } else if (results?.metadata?.title) {
          setExtensionName(results.metadata.title);
        }
      } catch (e) {
        // Silently fail - results might not exist yet (scan still running)
      }
    };
    fetchExtensionInfo();

    return () => { cancelled = true; };
  }, [scanId]);

  // Calculate scan progress based on stage
  useEffect(() => {
    if (!scanStage) return;
    
    const stageProgressMap = {
      extracting: 14,
      security_scan: 28,
      building_evidence: 42,
      applying_rules: 71,
      generating_report: 100,
    };
    
    setScanProgress(stageProgressMap[scanStage] || 0);
  }, [scanStage]);

  // Poll scan status while on this page (supports direct refresh/back navigation)
  // Stops polling once scan completes or fails to save server resources.
  // Also detects "already scanned" extensions (first poll returns scanned=true
  // before any in-progress state was observed).
  useEffect(() => {
    if (!scanId) return;

    let cancelled = false;
    let intervalId = null;

    const checkStatus = async () => {
      if (cancelled) return;

      try {
        const status = await realScanService.checkScanStatus(scanId);
        if (cancelled) return;

        // Check for API key errors (401)
        if (status.error_code === 401 || (status.status === "failed" && (status.error?.includes("API key") || status.error?.includes("Connection is down")))) {
          setError("Connection is down try back in a while");
          if (intervalId) { clearInterval(intervalId); intervalId = null; }
          return;
        }
        if (status.status === "failed") {
          if (status.error) setError(status.error);
          if (intervalId) { clearInterval(intervalId); intervalId = null; }
          return;
        }

        // Track whether we've ever seen an in-progress (non-complete) state.
        if (!status.scanned) {
          hasSeenInProgressRef.current = true;
        }

        if (status.scanned) {
          // Stop polling immediately on completion
          if (intervalId) { clearInterval(intervalId); intervalId = null; }

          // Detect "already scanned": completed on first poll, never saw in-progress
          const wasAlreadyScanned = !hasSeenInProgressRef.current;
          if (wasAlreadyScanned) {
            setAlreadyScanned(true);
            setScanProgress(100);
          }

          setScanComplete(true);
          if (!completionShownRef.current) {
            completionShownRef.current = true;
            setShowCompletionModal(true);
          }

          // Best-effort: fetch results and set current extension so results page has cache (no flash).
          try {
            const results = await realScanService.getRealScanResults(scanId);
            if (!cancelled && results) {
              setScanResults(results);
              setCurrentExtensionId(scanId);
            }
          } catch (_e) {
            // Results might not be ready yet — no further polling needed.
          }
        }
      } catch (e) {
        if (cancelled) return;
        if (e.message?.includes("401") || e.message?.includes("API key") || e.message?.includes("Connection is down")) {
          setError("Connection is down try back in a while");
          if (intervalId) { clearInterval(intervalId); intervalId = null; }
        }
      }
    };

    // Kick once immediately and then poll
    checkStatus();
    intervalId = setInterval(checkStatus, 2500);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [scanId, setError, setScanResults, setCurrentExtensionId]);

  // Reset state when scanId changes or on mount
  // This ensures that when navigating to a new scan, the game always shows immediately
  useEffect(() => {
    if (scanId) {
      setUserExited(false);
      setScanComplete(false);
      setAlreadyScanned(false);
      completionShownRef.current = false;
      hasSeenInProgressRef.current = false;
    }
  }, [scanId]);

  // Show loading screen when scanId exists in URL (unless user explicitly exited)
  const shouldShowLoading = scanId ? !userExited : false;

  // Handle errors with modal
  useEffect(() => {
    if (error && shouldShowLoading) {
      // Check for API key errors (401) - show user-friendly message
      let displayError = error;
      if (error.includes("API key") || error.includes("Invalid API key") || error.includes("Authentication") || error.includes("401") || error.includes("sk-proj")) {
        displayError = "Connection is down try back in a while";
      }
      setErrorMessage(displayError);
      setShowErrorModal(true);
      // Don't clear error - let user dismiss it
    }
  }, [error, shouldShowLoading]);

  // Catch any unhandled errors (parsing, network, etc.)
  useEffect(() => {
    const handleError = (event) => {
      if (shouldShowLoading) {
        let errorMsg = "Something went wrong";
        
        // Handle different error types
        if (event.error) {
          errorMsg = event.error?.message || String(event.error);
        } else if (event.message) {
          errorMsg = event.message;
        }
        
        // Check for common error patterns
        if (errorMsg.includes("401") || errorMsg.includes("API key") || errorMsg.includes("Invalid API key") || errorMsg.includes("Connection is down")) {
          errorMsg = "Connection is down try back in a while";
        } else if (errorMsg.includes("quota") || errorMsg.includes("token_quota") || (errorMsg.includes("403") && errorMsg.includes("token"))) {
          errorMsg = "Scan analysis quota exceeded. Check your provider limits or try again later.";
        } else if (errorMsg.includes("Connection refused") || errorMsg.includes("Errno 61") || errorMsg.includes("LLM service")) {
          errorMsg = "Scan analysis service unavailable. Check your provider configuration.";
        } else if (errorMsg.includes("JSON") || errorMsg.includes("parse")) {
          errorMsg = "Failed to parse server response. The scan may still be running.";
        } else if (errorMsg.includes("fetch") || errorMsg.includes("network") || errorMsg.includes("Failed to fetch")) {
          errorMsg = "Network error occurred. Check your connection and try again.";
        }
        
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        event.preventDefault();
      }
    };

    const handleUnhandledRejection = (event) => {
      if (shouldShowLoading) {
        let errorMsg = "Something went wrong";
        
        if (event.reason) {
          if (typeof event.reason === "string") {
            errorMsg = event.reason;
          } else if (event.reason?.message) {
            errorMsg = event.reason.message;
          } else {
            errorMsg = String(event.reason);
          }
        }
        
        // Check for API key errors first
        if (errorMsg.includes("401") || errorMsg.includes("API key") || errorMsg.includes("Invalid API key") || errorMsg.includes("Authentication") || errorMsg.includes("sk-proj") || errorMsg.includes("Connection is down")) {
          errorMsg = "Connection is down try back in a while";
        } else if (errorMsg.includes("quota") || errorMsg.includes("token_quota") || (errorMsg.includes("403") && errorMsg.includes("token"))) {
          errorMsg = "Scan analysis quota exceeded. Check your provider limits or try again later.";
        } else if (errorMsg.includes("Connection refused") || errorMsg.includes("Errno 61") || errorMsg.includes("LLM service")) {
          errorMsg = "Scan analysis service unavailable. Check your provider configuration.";
        } else if (errorMsg.includes("JSON") || errorMsg.includes("parse")) {
          errorMsg = "Failed to parse server response. The scan may still be running.";
        } else if (errorMsg.includes("fetch") || errorMsg.includes("network") || errorMsg.includes("Failed to fetch")) {
          errorMsg = "Network error occurred. Check your connection and try again.";
        }
        
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        event.preventDefault();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [shouldShowLoading]);

  const handleViewResults = useCallback(async () => {
    setUserExited(true);
    setShowCompletionModal(false);

    let extId = scanResults?.extension_id || scanId;
    let extName = scanResults?.extension_name;

    if (!extName && scanId) {
      try {
        const freshResults = await realScanService.getRealScanResults(scanId);
        if (freshResults) {
          extId = freshResults.extension_id || extId;
          extName = freshResults.extension_name;
          setScanResults(freshResults);
        }
      } catch (_e) { /* fall through with what we have */ }
    }

    const route = getScanResultsRoute(extId, extName);
    if (route) navigate(route, { replace: true });
  }, [scanResults?.extension_id, scanResults?.extension_name, scanId, navigate, setScanResults]);

  const handleDismissError = useCallback(() => {
    setShowErrorModal(false);
    setError(null);
    setErrorMessage("");
  }, [setError]);

  // Always render something - never show blank page
  // Show error if normalized ID is empty (invalid format or missing)
  if (!scanId) {
    if (import.meta.env.DEV) {
      logger.warn("[ScanProgressPage] No valid scanId found. Raw params:", params);
    }
    return (
      <div className="scan-progress-page">
        <div className="progress-container">
          <div className="no-scan-state">
            <div className="no-scan-icon">⚠️</div>
            <h2>Invalid Scan ID</h2>
            <p>
              {rawScanId 
                ? `The scan ID "${rawScanId}" is not in a valid format. Expected a Chrome extension ID (32 characters a-p) or upload scan UUID.`
                : "No scan ID provided in the URL."}
            </p>
            <Button onClick={() => navigate("/scan")} variant="default">
              Go to Scanner
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const showLoadingScreen = shouldShowLoading;

  return (
    <>
      <SEOHead
        title="Scan in progress"
        description="Extension scan in progress."
        pathname={location.pathname}
        noindex
      />
      <div className="scan-progress-page">
      {showLoadingScreen ? (
        <>
          {/* Header overlay */}
          <div className="scan-progress-header">
            <h1 className="scan-progress-title">
              {scanComplete
                ? (alreadyScanned
                    ? "Results ready"
                    : "Scan complete")
                : "Scan in progress"}
            </h1>
            {scanComplete && (
              <div className="scan-progress-actions">
                <Button
                  onClick={handleViewResults}
                  className="scan-progress-view-results"
                  variant="default"
                  size="lg"
                >
                  View Results
                </Button>
              </div>
            )}
          </div>

          {/* Minimal loading screen: spinning gear + agents investigating */}
          <div className="scan-loading-screen">
            <div className="scan-loading-gear" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <p className="scan-loading-text">
              {scanComplete ? "Report ready." : "Agents are investigating the files."}
            </p>
          </div>

          {/* Scan HUD */}
          <ScanHUD
            extensionIcon={extensionLogo}
            extensionName={extensionName || `Extension ${scanId?.substring(0, 8)}...`}
            extensionId={scanId}
            scanStage={scanStage}
            scanProgress={alreadyScanned ? 100 : scanProgress}
            onViewFindings={handleViewResults}
            isMobile={isMobile}
            scanComplete={scanComplete}
            alreadyScanned={alreadyScanned}
          />

          {/* Error Modal */}
          <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
            <DialogContent className="error-modal-content">
              <DialogHeader>
                <DialogTitle className="error-modal-title">
                  Something Went Wrong
                </DialogTitle>
                <DialogDescription className="error-modal-description">
                  {errorMessage || "An error occurred. You can try again or go back to the scanner."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={handleDismissError} variant="default">
                  Dismiss
                </Button>
                <Button onClick={() => navigate("/scan")} variant="outline">
                  Go to Scanner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Completion Modal */}
          <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
            <DialogContent className="completion-modal-content">
              <DialogHeader>
                <DialogTitle className="completion-modal-title">
                  {alreadyScanned ? "Results Available" : "Scan Complete"}
                </DialogTitle>
                <DialogDescription className="completion-modal-description">
                  {alreadyScanned
                    ? "This extension was previously scanned. Your report is ready to view."
                    : "Your extension scan has finished. View the results below."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={handleViewResults} variant="default">
                  View Results
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="progress-container">
          {/* Header */}
          <div className="progress-header">
            <Link to="/scan" className="back-link">
              ← Back to Scanner
            </Link>
            <div className="extension-header">
              <img 
                src={extensionLogo} 
                alt="Extension icon" 
                className="extension-logo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = EXTENSION_ICON_PLACEHOLDER;
                }}
              />
              <div className="extension-header-text">
                <h1 className="progress-title">Scan Status</h1>
                <p className="progress-subtitle">
                  Extension ID: <code>{scanId}</code>
                </p>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="error-state">
              <div className="error-icon">❌</div>
              <h2>Scan Failed</h2>
              <p className="error-message">{error}</p>
              <div className="error-actions">
                <Button onClick={() => setError(null)} variant="outline">
                  Dismiss
                </Button>
                <Button onClick={() => navigate("/scan")}>
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* No Active Scan State */}
          {!shouldShowLoading && !error && (
            <div className="no-scan-state">
              <div className="no-scan-icon">🔍</div>
              <h2>No Active Scan</h2>
              <p>
                There's no active scan for extension ID: <code>{scanId}</code>
                <br />
                The scan may have completed, or you can start a new scan.
              </p>
              <div className="no-scan-actions">
                <Button onClick={() => navigate(`/scan/results/${scanId}`)} variant="default">
                  Check Results
                </Button>
                <Button onClick={() => navigate("/scan")} variant="outline">
                  Start New Scan
                </Button>
                <Button onClick={() => navigate("/scan/history")} variant="outline">
                  View History
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};

export default ScanProgressPage;

