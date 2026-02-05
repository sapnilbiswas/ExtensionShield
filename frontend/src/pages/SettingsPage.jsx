import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Settings, 
  Shield, 
  Save, 
  Moon, 
  Sun, 
  FileText, 
  Bell, 
  User,
  Info,
  ExternalLink
} from "lucide-react";
import { Button } from "../components/ui/button";
import { useTheme } from "../context/ThemeContext";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    securityEngine: "standard", // standard, aggressive
    notifications: true,
  });
  const [saved, setSaved] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const stored = localStorage.getItem("threat_settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("threat_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <Settings className="inline-block w-6 h-6 mr-2" />
          Settings
        </h1>
        <p className="page-subtitle">
          Configure Extension Compliance Scanner system settings and preferences
        </p>
      </div>

      {/* Beta Launch Notice */}
      <div className="max-w-4xl mx-auto mb-6 p-4 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-warning mb-1">Beta Launch</h3>
          <p className="text-sm text-foreground-muted">
            ExtensionShield is currently in beta. Some features may be limited or subject to change. 
            We appreciate your feedback as we continue to improve the platform.
          </p>
        </div>
      </div>

      <div className="glass-card max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">System Configuration</h2>
          </div>
          <Button onClick={handleSave} className="gap-2">
            {saved ? <span className="text-green-400">Saved!</span> : <><Save className="w-4 h-4" /> Save Changes</>}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Appearance Section */}
          <div className="p-6 rounded-lg bg-surface/50 border border-border/50">
            <div className="flex items-start gap-4">
              {theme === "dark" ? (
                <Moon className="w-6 h-6 text-primary mt-1" />
              ) : (
                <Sun className="w-6 h-6 text-warning mt-1" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1">Appearance</div>
                <p className="text-sm text-foreground-muted mb-4">
                  Choose your preferred theme. Changes apply immediately.
                </p>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleTheme}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
                      theme === "dark"
                        ? "bg-primary/20 border-primary"
                        : "bg-background/50 border-border hover:border-border-strong"
                    }`}
                  >
                    {theme === "dark" ? (
                      <>
                        <Moon className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-semibold">Dark Mode</div>
                          <div className="text-xs text-foreground-muted">Currently active</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Sun className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-semibold">Light Mode</div>
                          <div className="text-xs text-foreground-muted">Currently active</div>
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Engine Section */}
          <div className="p-6 rounded-lg bg-surface/50 border border-border/50">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-success mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-lg">Security Engine Mode</div>
                <p className="text-sm text-foreground-muted mb-4">
                  Set the sensitivity of the security analysis engine.
                </p>

                <div className="flex gap-4">
                  <label
                    className={`flex-1 p-4 rounded-lg border cursor-pointer transition-all ${
                      settings.securityEngine === "standard"
                        ? "bg-primary/20 border-primary"
                        : "bg-background/50 border-border hover:border-border-strong"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="engine"
                        checked={settings.securityEngine === "standard"}
                        onChange={() => handleChange("securityEngine", "standard")}
                        className="text-primary"
                      />
                      <span className="font-bold">Standard</span>
                    </div>
                    <p className="text-xs text-foreground-muted">
                      Balanced checks for common vulnerabilities and known threats.
                    </p>
                  </label>

                  <label
                    className={`flex-1 p-4 rounded-lg border cursor-pointer transition-all ${
                      settings.securityEngine === "aggressive"
                        ? "bg-destructive/10 border-destructive"
                        : "bg-background/50 border-border hover:border-border-strong"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="radio"
                        name="engine"
                        checked={settings.securityEngine === "aggressive"}
                        onChange={() => handleChange("securityEngine", "aggressive")}
                        className="text-destructive"
                      />
                      <span className="font-bold text-destructive">Aggressive</span>
                    </div>
                    <p className="text-xs text-foreground-muted">
                      Deep heuristic analysis. May produce more false positives.
                    </p>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="p-6 rounded-lg bg-surface/50 border border-border/50">
            <div className="flex items-start gap-4">
              <Bell className="w-6 h-6 text-primary mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1">Notifications</div>
                <p className="text-sm text-foreground-muted mb-4">
                  Manage how you receive updates and alerts.
                </p>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleChange("notifications", e.target.checked)}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-medium">Enable Notifications</div>
                    <div className="text-xs text-foreground-muted">
                      Receive alerts for scan completions and important updates
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy & Legal Section */}
          <div className="p-6 rounded-lg bg-surface/50 border border-border/50">
            <div className="flex items-start gap-4">
              <FileText className="w-6 h-6 text-primary mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1">Privacy & Legal</div>
                <p className="text-sm text-foreground-muted mb-4">
                  Review our policies and legal information.
                </p>
                
                <div className="space-y-3">
                  <Link
                    to="/privacy-policy"
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-foreground-muted group-hover:text-primary transition-colors" />
                      <div>
                        <div className="font-medium">Privacy Policy</div>
                        <div className="text-xs text-foreground-muted">
                          How we collect, use, and protect your data
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-foreground-muted group-hover:text-primary transition-colors" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Account Section */}
          <div className="p-6 rounded-lg bg-surface/50 border border-border/50">
            <div className="flex items-start gap-4">
              <User className="w-6 h-6 text-primary mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1">Account</div>
                <p className="text-sm text-foreground-muted mb-4">
                  Manage your account settings and preferences.
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-border/30">
                    <span className="text-foreground-muted">Account Status</span>
                    <span className="font-medium text-success">Active</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/30">
                    <span className="text-foreground-muted">Plan</span>
                    <span className="font-medium">Free (Beta)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
