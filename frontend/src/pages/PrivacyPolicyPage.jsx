import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Shield, Lock, Eye, Database, Users } from "lucide-react";
import { Button } from "../components/ui/button";

const PrivacyPolicyPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/settings" className="inline-flex items-center gap-2 text-foreground-muted hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Settings</span>
        </Link>
        <h1 className="page-title">
          <FileText className="inline-block w-6 h-6 mr-2" />
          Privacy Policy
        </h1>
        <p className="page-subtitle">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Introduction */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">Introduction</h2>
          <p className="text-foreground-muted leading-relaxed">
            ExtensionShield ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our Chrome extension 
            security scanning service. Please read this policy carefully to understand our practices regarding your 
            data and how we will treat it.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Information We Collect</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Information You Provide</h3>
              <ul className="list-disc list-inside space-y-2 text-foreground-muted ml-4">
                <li>Extension URLs or IDs that you submit for scanning</li>
                <li>Account information (name, email) when you sign in</li>
                <li>Feedback, support requests, or communications with us</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2. Automatically Collected Information</h3>
              <ul className="list-disc list-inside space-y-2 text-foreground-muted ml-4">
                <li>Scan results and analysis data for extensions you scan</li>
                <li>Usage analytics (page views, feature usage) to improve our service</li>
                <li>Technical information (browser type, IP address, device information)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3. Extension Data</h3>
              <p className="text-foreground-muted">
                When you scan a Chrome extension, we analyze publicly available information from the Chrome Web Store, 
                including manifest files, permissions, and store listings. We do not access or store any personal data 
                from the extensions themselves.
              </p>
            </div>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">How We Use Your Information</h2>
          </div>
          
          <ul className="list-disc list-inside space-y-2 text-foreground-muted ml-4">
            <li>To provide, maintain, and improve our scanning service</li>
            <li>To process your scan requests and generate security reports</li>
            <li>To authenticate your account and manage your preferences</li>
            <li>To send you notifications about scan completions (if enabled)</li>
            <li>To analyze usage patterns and improve our service</li>
            <li>To comply with legal obligations and protect our rights</li>
            <li>To communicate with you about updates, features, or support</li>
          </ul>
        </div>

        {/* Data Sharing and Disclosure */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Data Sharing and Disclosure</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-foreground-muted">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            
            <ul className="list-disc list-inside space-y-2 text-foreground-muted ml-4">
              <li>
                <strong>Service Providers:</strong> We may share data with third-party service providers who perform 
                services on our behalf (e.g., hosting, analytics, authentication)
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose information if required by law or to protect 
                our rights and safety
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale, your information 
                may be transferred as part of that transaction
              </li>
              <li>
                <strong>With Your Consent:</strong> We may share information with your explicit consent
              </li>
            </ul>
          </div>
        </div>

        {/* Data Security */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Data Security</h2>
          </div>
          
          <p className="text-foreground-muted leading-relaxed">
            We implement appropriate technical and organizational measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the 
            Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect 
            your data, we cannot guarantee absolute security.
          </p>
        </div>

        {/* Your Rights */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Your Rights</h2>
          </div>
          
          <p className="text-foreground-muted mb-4">
            Depending on your location, you may have certain rights regarding your personal information:
          </p>
          
          <ul className="list-disc list-inside space-y-2 text-foreground-muted ml-4">
            <li><strong>Access:</strong> Request access to your personal data</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service</li>
            <li><strong>Objection:</strong> Object to processing of your personal data</li>
            <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
          </ul>
          
          <p className="text-foreground-muted mt-4">
            To exercise these rights, please contact us at the information provided below.
          </p>
        </div>

        {/* Cookies */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
          <p className="text-foreground-muted leading-relaxed">
            We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you 
            do not accept cookies, you may not be able to use some portions of our service.
          </p>
        </div>

        {/* Children's Privacy */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
          <p className="text-foreground-muted leading-relaxed">
            Our service is not intended for children under the age of 13. We do not knowingly collect personal information 
            from children under 13. If you are a parent or guardian and believe your child has provided us with personal 
            information, please contact us immediately.
          </p>
        </div>

        {/* Changes to This Policy */}
        <div className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-4">Changes to This Privacy Policy</h2>
          <p className="text-foreground-muted leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy 
            Policy periodically for any changes.
          </p>
        </div>

        {/* Contact Us */}
        <div className="glass-card p-6 bg-primary/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p className="text-foreground-muted mb-4">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <div className="space-y-2 text-foreground-muted">
            <p>
              <strong>Email:</strong> privacy@extensionshield.com
            </p>
            <p>
              <strong>GitHub:</strong>{" "}
              <a 
                href="https://github.com/Stanzin7/ExtensionShield" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                github.com/Stanzin7/ExtensionShield
              </a>
            </p>
          </div>
        </div>

        {/* Back to Settings */}
        <div className="flex justify-center pt-4">
          <Link to="/settings">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

