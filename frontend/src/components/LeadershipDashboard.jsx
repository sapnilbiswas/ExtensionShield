import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import "./LeadershipDashboard.scss";

/**
 * LeadershipDashboard - displays top contributors by karma points
 * Shows real-time leaderboard of most active community members
 */
function LeadershipDashboard({ limit = 10 }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaders();
  }, [limit]);

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch top contributors by karma points
      const { data, error: fetchError } = await supabase
        .from("user_profiles")
        .select("user_id, karma_points, total_scans, created_at")
        .order("karma_points", { ascending: false })
        .limit(limit);

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      // Fetch user emails/names from auth.users for display
      if (data && data.length > 0) {
        const enrichedLeaders = await Promise.all(
          data.map(async (profile) => {
            try {
              // Try to get user metadata if available
              const { data: userData, error: userError } = await supabase
                .from("user_profiles")
                .select("user_id")
                .eq("user_id", profile.user_id)
                .single();

              // For now, use user_id as fallback - you can extend this
              // to fetch from a users_public table or auth metadata
              return {
                ...profile,
                username: profile.user_id.substring(0, 8).toUpperCase(),
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user_id}`,
              };
            } catch (err) {
              return {
                ...profile,
                username: profile.user_id.substring(0, 8).toUpperCase(),
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.user_id}`,
              };
            }
          })
        );

        setLeaders(enrichedLeaders);
      } else {
        setLeaders([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return null;
    }
  };

  return (
    <div className="leadership-dashboard">
      <div className="dashboard-header">
        <h2>Leaderboard</h2>
        <p className="dashboard-subtitle">Ranked by karma</p>
      </div>

      {loading && <div className="loading-state">Loading…</div>}

      {error && <div className="error-state">Error: {error}</div>}

      {!loading && !error && leaders.length === 0 && (
        <div className="empty-state">
          <p>No one on the board yet. Scan extensions and contribute to get listed.</p>
        </div>
      )}

      {!loading && !error && leaders.length > 0 && (
        <>
          <div className="leaderboard-list">
            {leaders.map((leader, index) => (
              <div key={leader.user_id} className="leaderboard-row">
                <div className="rank-column">
                  <span className="rank">
                    {getRankBadge(index) || `#${index + 1}`}
                  </span>
                </div>

                <div className="avatar-column">
                  <img
                    src={leader.avatar}
                    alt={leader.username}
                    className="avatar"
                  />
                </div>

                <div className="info-column">
                  <p className="username">{leader.username}</p>
                  <p className="stats">
                    {leader.total_scans} scans · Member since{" "}
                    {new Date(leader.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="karma-column">
                  <div className="karma-badge">
                    <span className="karma-value">{leader.karma_points}</span>
                    <span className="karma-label">karma</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-footer">
            <p>
              💡 <strong>Earn karma:</strong> Scan extensions and share your findings with the
              community to climb the leaderboard!
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default LeadershipDashboard;
