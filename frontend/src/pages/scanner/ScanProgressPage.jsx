import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import RocketGame from "../../components/RocketGame";
import { useScan } from "../../context/ScanContext";
import { EXTENSION_ICON_PLACEHOLDER } from "../../utils/constants";
import ShieldLogo from "../../components/ShieldLogo";
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
  const { scanId } = useParams();
  const navigate = useNavigate();
  const {
    isScanning,
    scanStage,
    error,
    setError,
    scanResults,
    currentExtensionId,
  } = useScan();
  
  const [extensionLogo, setExtensionLogo] = useState(EXTENSION_ICON_PLACEHOLDER);
  const [scanComplete, setScanComplete] = useState(false);
  const [userExited, setUserExited] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [gameStarted, setGameStarted] = useState(false); // Track if game has started
  
  // Fetch extension logo with error handling
  useEffect(() => {
    if (!scanId) return;
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || "";
    const iconUrl = `${API_BASE_URL}/api/scan/icon/${scanId}`;
    
    // Try to load the icon with error handling
    try {
      const img = new Image();
      img.onload = () => {
        setExtensionLogo(iconUrl);
      };
      img.onerror = () => {
        setExtensionLogo(EXTENSION_ICON_PLACEHOLDER);
      };
      img.src = iconUrl;
    } catch (err) {
      // Silently fail - use placeholder
      setExtensionLogo(EXTENSION_ICON_PLACEHOLDER);
    }
  }, [scanId]);

  // Track when game should start (when scan begins)
  useEffect(() => {
    if (isScanning && currentExtensionId === scanId && !gameStarted) {
      setGameStarted(true);
    }
  }, [isScanning, currentExtensionId, scanId, gameStarted]);

  // Track scan completion but don't auto-redirect - let user continue playing
  useEffect(() => {
    if (scanResults && !isScanning && currentExtensionId === scanId && !userExited) {
      setScanComplete(true);
      setShowCompletionModal(true);
    }
  }, [scanResults, isScanning, scanId, currentExtensionId, userExited]);

  // Handle errors with modal (don't close game)
  useEffect(() => {
    if (error && shouldShowGame) {
      setErrorMessage(error);
      setShowErrorModal(true);
      // Don't clear error - let user dismiss it
    }
  }, [error, shouldShowGame]);

  // Catch any unhandled errors (parsing, network, etc.)
  useEffect(() => {
    const handleError = (event) => {
      if (shouldShowGame) {
        let errorMsg = "Something went wrong";
        
        // Handle different error types
        if (event.error) {
          errorMsg = event.error?.message || String(event.error);
        } else if (event.message) {
          errorMsg = event.message;
        }
        
        // Check for common error patterns
        if (errorMsg.includes("JSON") || errorMsg.includes("parse")) {
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
      if (shouldShowGame) {
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
        
        // Check for common error patterns
        if (errorMsg.includes("JSON") || errorMsg.includes("parse")) {
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
  }, [shouldShowGame]);

  // Manual navigation to results
  const handleViewResults = () => {
    setUserExited(true);
    setShowCompletionModal(false);
    if (scanResults) {
      // If we have both extensionId and buildHash, use canonical URL
      if (scanResults.extension_id && scanResults.build_hash) {
        navigate(`/extension/${scanResults.extension_id}/version/${scanResults.build_hash}`, { replace: true });
      } else {
        // Fallback to scan results URL
        navigate(`/scan/results/${scanId}`, { replace: true });
      }
    } else {
      // Fallback if no results yet
      navigate(`/scan/results/${scanId}`, { replace: true });
    }
  };

  // Handle error modal dismissal
  const handleDismissError = () => {
    setShowErrorModal(false);
    setError(null);
    setErrorMessage("");
  };

  // Handle continue playing after completion
  const handleContinuePlaying = () => {
    setShowCompletionModal(false);
  };

  // Show game if we have an active scan OR if scan is complete but user hasn't exited yet
  // OR if game has started (to keep it open even if errors occur)
  const shouldShowGame = 
    (isScanning && currentExtensionId === scanId) || 
    (scanComplete && !userExited) ||
    (gameStarted && currentExtensionId === scanId && !userExited);

  return (
    <div className="scan-progress-page">
      {shouldShowGame ? (
        <>
          {/* Retro Style Header Overlay */}
          <div className="retro-header-overlay">
            <div className="retro-logo-container">
              <ShieldLogo size={48} />
            </div>
            <h1 className="retro-title">
              <span className="retro-text">
                {scanComplete ? "SCAN COMPLETE" : "ANALYZING EXTENSION"}
              </span>
            </h1>
            <div className="retro-subtitle">
              <span className="retro-id">ID: {scanId}</span>
            </div>
            {/* Exit button appears when scan is complete */}
            {scanComplete && (
              <div className="retro-exit-container">
                <Button
                  onClick={handleViewResults}
                  className="retro-exit-button"
                  variant="default"
                  size="lg"
                >
                  View Results
                </Button>
              </div>
            )}
          </div>

          {/* Full Viewport Game Container */}
          <div className="game-container-fullscreen">
            <RocketGame 
              isActive={true} 
              statusLabel={
                scanComplete 
                  ? "Scan complete! Keep playing or click 'View Results' above." 
                  : "Running the scan... Play a game till then!"
              }
            />
          </div>

          {/* Error Modal - doesn't close game */}
          <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
            <DialogContent className="error-modal-content">
              <DialogHeader>
                <DialogTitle className="error-modal-title">
                  ⚠️ Something Went Wrong
                </DialogTitle>
                <DialogDescription className="error-modal-description">
                  {errorMessage || "An error occurred, but you can continue playing the game."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={handleDismissError} variant="default">
                  Continue Playing
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
                  ✅ Scan Complete!
                </DialogTitle>
                <DialogDescription className="completion-modal-description">
                  Your extension scan has finished successfully. You can continue playing the game or view the results now.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={handleContinuePlaying} variant="outline">
                  Keep Playing
                </Button>
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
          {!shouldShowGame && !error && (
            <div className="no-scan-state">
              <div className="no-scan-icon">🔍</div>
              <h2>No Active Scan</h2>
              <p>
                There's no active scan for this extension ID. 
                You can start a new scan or check the scan history.
              </p>
              <div className="no-scan-actions">
                <Button onClick={() => navigate("/scan")} variant="default">
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
  );
};

export default ScanProgressPage;

