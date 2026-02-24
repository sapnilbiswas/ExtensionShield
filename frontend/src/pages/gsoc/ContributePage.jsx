import React from "react";
import { useNavigate } from "react-router-dom";
import SEOHead from "../../components/SEOHead";
import "./ContributePage.scss";

const ContributePage = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <SEOHead
        title="Everyone Can Contribute | ExtensionShield"
        description="Help build a safer web. Scan extensions, report threats, help others—every contribution matters, no coding required."
        pathname="/contribute"
      />

      <div className="contribute-page">
        <div className="contribute-content">
          <header className="contribute-header">
            <h1>Everyone Can Contribute</h1>
            <p className="subtitle">
              Help build a safer web for everyone. No coding required. Every scan you do helps the next person.
            </p>
          </header>

          {/* Main Ways to Contribute - For Everyone */}
          <div className="contribution-grid">
            
            <div className="contribution-card" onClick={() => navigate('/scan')}>
              <div className="card-icon" data-type="scan">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="card-body">
                <h3>Scan Extensions</h3>
                <p>Every scan builds our database and helps protect the next person</p>
                <span className="card-tag">High impact</span>
              </div>
            </div>

            <div className="contribution-card">
              <div className="card-icon" data-type="report">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="card-body">
                <h3>Report Threats</h3>
                <p>Found a malicious extension? Report it to protect millions of users</p>
                <span className="card-tag critical">Critical impact</span>
              </div>
            </div>

            <div className="contribution-card">
              <div className="card-icon" data-type="community">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="card-body">
                <h3>Help the Community</h3>
                <p>Answer questions, share insights, recommend safe alternatives</p>
                <span className="card-tag">Community builder</span>
              </div>
            </div>

            <div className="contribution-card">
              <div className="card-icon" data-type="share">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <div className="card-body">
                <h3>Share & Spread</h3>
                <p>Tell others about ExtensionShield. Every user makes the web safer</p>
                <span className="card-tag">Amplify</span>
              </div>
            </div>
          </div>

          <footer className="contribute-footer">
            <p>
              Every contribution—no matter how small—helps protect millions of users. When you scan an extension, you help us build better threat detection. When you report a threat, you protect others from harm. Together, we create a safer web.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default ContributePage;

