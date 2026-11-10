
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  UserRound,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown
} from "lucide-react";

import drishteeLogo from "./assets/drishtee-logo.png";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadCandidate = () => {
      const savedCandidate = sessionStorage.getItem("candidate");

      if (savedCandidate) {
        try {
          setCandidate(JSON.parse(savedCandidate));
        } catch {
          sessionStorage.removeItem("candidate");
          setCandidate(null);
        }
      } else {
        setCandidate(null);
      }
    };

    loadCandidate();

    window.addEventListener("storage", loadCandidate);
    window.addEventListener("candidateAuthChanged", loadCandidate);

    return () => {
      window.removeEventListener("storage", loadCandidate);
      window.removeEventListener("candidateAuthChanged", loadCandidate);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("candidateToken");
    sessionStorage.removeItem("candidate");

    setCandidate(null);
    setMenuOpen(false);

    navigate("/");
  };

  return (
    <header className="top-navbar">

      {/* DRISHTEE BRAND LOGO */}
      <Link to="/" className="navbar-logo">

        <img
          src={drishteeLogo}
          alt="Drishtee Logo"
          className="navbar-logo-image"
        />

        <div className="navbar-logo-text">
          <span className="logo-name">
            DRISHTEE
          </span>

          <span className="logo-subtitle">
            CAREERS
          </span>
        </div>

      </Link>

      {/* NAVBAR ACTIONS */}
      <div className="navbar-actions">

        {candidate ? (

          /* LOGGED-IN CANDIDATE */
          <div className="profile-dropdown">

            <button
              type="button"
              className="logged-in-profile"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="profile-avatar">
                <UserRound size={20} />
              </div>

              <div className="profile-info">
                <span className="profile-name">
                  {candidate.full_name}
                </span>

                <span className="profile-label">
                  Candidate
                </span>
              </div>

              <ChevronDown size={17} />
            </button>

            {menuOpen && (
              <div className="profile-menu">

                <div className="profile-menu-details">
                  <strong>{candidate.full_name}</strong>
                  <span>{candidate.email}</span>
                </div>

                <Link
                  to="/your-career"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserRound size={17} />
                  My Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  Logout
                </button>

              </div>
            )}

          </div>

        ) : (

          /* LOGIN AND REGISTER */
          <>
            <Link
              to="/login"
              className="navbar-login-button"
            >
              <LogIn size={19} />
              <span>Login</span>
            </Link>

            <Link
              to="/register"
              className="navbar-register-button"
            >
              <UserPlus size={19} />
              <span>Register</span>
            </Link>
          </>
        )}

      </div>

    </header>
  );
}

export default Navbar;
