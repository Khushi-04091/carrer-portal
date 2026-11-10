
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle
} from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Return to the selected job after successful login.
  const redirectPath =
    location.state?.from || sessionStorage.getItem("loginRedirect") || "/your-career";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://carrer-portal-dpo8.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.token) {
        throw new Error("Login response did not contain an authentication token.");
      }

      // Store candidate login information.
      sessionStorage.setItem("candidateToken", data.token);
      sessionStorage.setItem(
        "candidate",
        JSON.stringify(data.candidate)
      );

      setSuccess("Login successful! Redirecting...");

      // Remove the saved redirect after successful login.
      sessionStorage.removeItem("loginRedirect");

      // Return to the selected job or candidate dashboard.
      setTimeout(() => {
        navigate(redirectPath, {
          replace: true
        });
      }, 800);

    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message ||
        "Unable to connect to the server. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* LEFT INFORMATION SECTION */}

        <div className="auth-left">

          <span className="auth-eyebrow">
            WELCOME BACK
          </span>

          <h1>
            Your journey.
            <span>Your opportunity.</span>
          </h1>

          <p>
            Continue exploring meaningful career opportunities
            and take the next step towards creating a positive
            impact with Drishtee.
          </p>

          <div className="auth-highlight">

            <div className="auth-highlight-icon">
              <CheckCircle size={24} />
            </div>

            <div>
              <strong>Your career journey starts here.</strong>

              <span>
                Access your profile and track your applications.
              </span>
            </div>

          </div>
        </div>

        {/* LOGIN FORM */}

        <div className="auth-form-card">

          <div className="auth-form-heading">

            <span className="section-label">
              CANDIDATE LOGIN
            </span>

            <h2>Welcome back!</h2>

            <p>
              Login to your Drishtee Careers account.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* EMAIL */}

            <div className="auth-field">

              <label htmlFor="login-email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <Mail size={18} />

                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="Enter your registered email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />

              </div>
            </div>

            {/* PASSWORD */}

            <div className="auth-field">

              <label htmlFor="login-password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <LockKeyhole size={18} />

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>

            {/* ERROR MESSAGE */}

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            {/* SUCCESS MESSAGE */}

            {success && (
              <div className="auth-success" role="status">
                <CheckCircle size={18} />
                <span>{success}</span>
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login to Account"}

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>

          <div className="auth-switch">
            Don't have an account?

            <Link
              to="/register"
              state={{ from: redirectPath }}
            >
              {" "}Create Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
