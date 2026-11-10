
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  FileText,
  BriefcaseBusiness,
  UserCheck,
  LogOut
} from "lucide-react";

import "./HRDashboard.css";

function HRDashboard() {
  const navigate = useNavigate();

  const [hrUser, setHrUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("hrUser") || "null");
    } catch {
      return null;
    }
  });

  const [stats, setStats] = useState({
    totalCandidates: 0,
    totalApplications: 0,
    openPositions: 0,
    shortlisted: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      const token = sessionStorage.getItem("hrToken");

      if (!token || !hrUser) {
        navigate("/hr/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://carrer-portal-dpo8.onrender.com/api/hr/dashboard/stats",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const result = await response.json();

        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem("hrToken");
          sessionStorage.removeItem("hrUser");
          navigate("/hr/login", { replace: true });
          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load dashboard statistics."
          );
        }

        setStats({
          totalCandidates: result.stats?.totalCandidates ?? 0,
          totalApplications: result.stats?.totalApplications ?? 0,
          openPositions: result.stats?.openPositions ?? 0,
          shortlisted: result.stats?.shortlisted ?? 0
        });

      } catch (err) {
        console.error("Dashboard Error:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate, hrUser]);

  // HR Logout
  const handleLogout = () => {
    sessionStorage.removeItem("hrToken");
    sessionStorage.removeItem("hrUser");

    setHrUser(null);

    navigate("/hr/login", { replace: true });
  };

  // Navigate to Manage Candidates
  const handleManageCandidates = () => {
    navigate("/hr/candidates");
  };

  return (
    <div className="hr-dashboard">

      {/* Dashboard Header */}
      <div className="hr-dashboard-header">

        <div>
          <span className="hr-dashboard-label">
            DRISHTEE CAREERS
          </span>

          <h1>HR Dashboard</h1>

          <p>
            Welcome, {hrUser?.full_name || "HR Administrator"}!
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="hr-logout-btn"
        >
          <LogOut size={17} />
          Logout
        </button>

      </div>

      {/* Welcome Section */}
      <div className="hr-welcome-card">

        <h2>
          Welcome to the Recruitment Management Portal
        </h2>

        <p>
          Manage candidate applications, recruitment activities,
          vacancies and hiring processes from one place.
        </p>

        <span>
          Logged in as: {hrUser?.role || "HR"}
        </span>

        {/* Manage Candidates Button */}
        <div className="hr-dashboard-actions">
          <button
            className="hr-filter-button"
            onClick={handleManageCandidates}
            type="button"
          >
            <Users size={17} />
            Manage Candidates
          </button>
        </div>

      </div>

      {/* Dashboard Statistics */}
      <div className="hr-stats-grid">

        <div className="hr-stat-card">
          <Users size={27} />

          <h3>Total Candidates</h3>

          <p>
            {loading ? "Loading..." : stats.totalCandidates}
          </p>
        </div>

        <div className="hr-stat-card">
          <FileText size={27} />

          <h3>Applications</h3>

          <p>
            {loading ? "Loading..." : stats.totalApplications}
          </p>
        </div>

        <div className="hr-stat-card">
          <BriefcaseBusiness size={27} />

          <h3>Open Positions</h3>

          <p>
            {loading ? "Loading..." : stats.openPositions}
          </p>
        </div>

        <div className="hr-stat-card">
          <UserCheck size={27} />

          <h3>Shortlisted</h3>

          <p>
            {loading ? "Loading..." : stats.shortlisted}
          </p>
        </div>

      </div>

      {/* Error Message */}
      {error && (
        <div className="hr-dashboard-error">
          {error}
        </div>
      )}

    </div>
  );
}

export default HRDashboard;
