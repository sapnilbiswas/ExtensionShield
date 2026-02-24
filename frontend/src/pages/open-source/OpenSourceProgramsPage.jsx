import React from "react";
import { Link } from "react-router-dom";
import SEOHead from "../../components/SEOHead";
import RainfallDroplets from "../../components/RainfallDroplets";
import "./OpenSourceProgramsPage.scss";

/**
 * Open Source Programs hub: programs applied for 2026 (GSoC, etc.).
 * Each program links to its detail page (e.g. GSoC → /gsoc/ideas).
 */
const PROGRAMS = [
  {
    id: "gsoc",
    name: "Google Summer of Code",
    description: "Project ideas for GSoC contributors. ExtensionShield ideas: extension security, SAST, and community tooling.",
    status: "Applied",
    statusVariant: "applied", // applied | rejected | accepted
    path: "/gsoc/ideas",
    icon: "☀️",
    iconClass: "gsoc",
  },
  // Add more programs here, e.g.:
  // { id: "outreachy", name: "Outreachy", description: "...", status: "Rejected", statusVariant: "rejected", path: "/open-source/outreachy", icon: "🌍", iconClass: "outreachy" },
];

const OpenSourceProgramsPage = () => {
  return (
    <>
      <SEOHead
        title="Open Source Programs 2026 | ExtensionShield"
        description="Open source programs ExtensionShield has applied to for 2026: Google Summer of Code and more. Explore project ideas and contribution opportunities."
        pathname="/open-source/programs"
        keywords="open source programs 2026, Google Summer of Code, GSoC, extension security, open source contribution"
      />

      <div className="open-source-programs-page">
        <RainfallDroplets />

        <div className="open-source-programs-content">
          <header className="open-source-programs-header">
            <div className="oss-badge">🌱 Open Source Programs</div>
            <h1>Programs Applied for 2026</h1>
            <p>
              ExtensionShield has applied to the following open source and mentorship programs for 2026.
              Select a program to view project ideas and how to get involved.
            </p>
          </header>

          <div className="programs-grid">
            {PROGRAMS.map((program) => (
              <Link key={program.id} to={program.path} className="program-card">
                <div className={`program-icon ${program.iconClass}`}>{program.icon}</div>
                <div className="program-content">
                  <h3>{program.name}</h3>
                  <p>{program.description}</p>
                  <span className={`program-status program-status--${program.statusVariant}`}>
                    {program.status}
                  </span>
                </div>
                <span className="arrow">→</span>
              </Link>
            ))}
          </div>

          <p className="programs-note">
            Additional 2026 programs may be listed as applications are submitted. Have a program to suggest?{" "}
            <Link to="/community#connect">Join our community</Link> or open an issue on GitHub.
          </p>
        </div>
      </div>
    </>
  );
};

export default OpenSourceProgramsPage;
