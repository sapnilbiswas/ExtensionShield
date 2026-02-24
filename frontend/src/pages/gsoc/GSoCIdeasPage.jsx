import React from "react";
import { Link } from "react-router-dom";
import SEOHead from "../../components/SEOHead";
import "./GSoCIdeasPage.scss";

const GSoCIdeasPage = () => {
  const ideas = [
    {
      id: "scoring-engine",
      title: "Scoring Engine Enhancement",
      difficulty: "Hard",
      skills: ["Python", "FastAPI", "Data Analysis"],
      description: "Improve our risk scoring pipeline that analyzes extensions for security, privacy, and governance signals. Help make automated risk detection more accurate by incorporating community feedback signals into the scoring algorithm.",
      goals: [
        "Analyze current scoring weights and identify improvement areas",
        "Integrate community report data as scoring input signals",
        "Build A/B testing framework to measure scoring accuracy",
        "Create scoring calibration dashboard with real-world metrics"
      ]
    },
    {
      id: "community-feedback",
      title: "Community Reporting & Review System",
      difficulty: "Medium",
      skills: ["React", "Node.js", "PostgreSQL"],
      description: "Build the community feedback layer that lets users report risky behavior, review extensions, and recommend safe alternatives. This creates a feedback loop where real-world reports improve our automated detection over time.",
      goals: [
        "Design and implement structured issue reporting flow",
        "Build review and recommendation submission system",
        "Create moderation queue for community submissions",
        "Connect feedback signals to scoring engine pipeline"
      ]
    },
    {
      id: "qa-testing",
      title: "QA & Site Reliability",
      difficulty: "Medium",
      skills: ["Playwright", "Jest", "CI/CD", "Python"],
      description: "Build comprehensive testing infrastructure to ensure scan reliability and site stability. Create automated test suites for the scanner, API, and frontend to catch issues before they reach users.",
      goals: [
        "Write end-to-end tests for critical scan workflows",
        "Build API integration test suite with mock extensions",
        "Set up automated regression testing in CI/CD pipeline",
        "Create monitoring and alerting for scan failures"
      ]
    },
    {
      id: "developer-tools",
      title: "Developer Tools & Documentation",
      difficulty: "Easy",
      skills: ["TypeScript", "Technical Writing", "API Design"],
      description: "Make it easier for developers to integrate ExtensionShield into their workflows. Build SDK libraries, improve API documentation, and create code examples that help teams adopt extension scanning.",
      goals: [
        "Create JavaScript/TypeScript SDK for the API",
        "Write comprehensive API documentation with examples",
        "Build sample integrations (GitHub Action, CLI tool)",
        "Add interactive API explorer to the docs site"
      ]
    }
  ];

  return (
    <>
      <SEOHead
        title="Google Summer of Code Ideas | ExtensionShield"
        description="GSoC project ideas: Help build open-source tools that scan Chrome extensions for risky behavior and empower community-driven security through shared visibility."
        pathname="/gsoc/ideas"
      />

      <div className="gsoc-ideas-page">
        <div className="gsoc-content">
          <header className="gsoc-header">
            <div className="gsoc-badge">
              <span className="gsoc-logo">☀️</span>
              Google Summer of Code 2026
            </div>
            <h1>Project Ideas</h1>
            <p className="intro-text">
              ExtensionShield scans Chrome extensions for risky behavior—security, privacy, 
              and governance signals—then lets the community report, review, and recommend extensions. 
              This shared visibility helps catch issues earlier and makes risk more transparent.
            </p>
            <p className="sub-text">
              We're open source because transparency matters. These projects help build that vision.
            </p>
          </header>

          <div className="ideas-list">
            {ideas.map((idea) => (
              <div key={idea.id} className="idea-card">
                <div className="idea-header">
                  <h3>{idea.title}</h3>
                  <span className={`difficulty-badge ${idea.difficulty.toLowerCase()}`}>
                    {idea.difficulty}
                  </span>
                </div>
                <p className="idea-description">{idea.description}</p>
                <div className="idea-skills">
                  {idea.skills.map((skill) => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
                <div className="idea-goals">
                  <h4>Goals</h4>
                  <ul>
                    {idea.goals.map((goal, i) => (
                      <li key={i}>{goal}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="gsoc-cta">
            <h3>Have your own idea?</h3>
            <p>We welcome proposals that align with our mission—automated scanning + community feedback = better extension safety.</p>
            <div className="cta-buttons">
              <Link to="/contribute" className="cta-button primary">
                Contributor Guide
              </Link>
              <Link to="/community" className="cta-button secondary">
                Join Community
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GSoCIdeasPage;

