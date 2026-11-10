
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";
import "./HRLogin.css";

function HRLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/hr/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed.");
      }

      sessionStorage.setItem("hrToken", result.token);
      sessionStorage.setItem("hrUser", JSON.stringify(result.hr));

      navigate("/hr/dashboard");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hr-login-page">
      <div className="hr-login-card">

        <div className="hr-login-brand">
          <h2>DRISHTEE</h2>
          <span>CAREERS</span>
        </div>

        <div className="hr-login-heading">
          <div className="hr-login-icon">
            <LockKeyhole size={27} />
          </div>

          <h1>HR Portal Login</h1>
          <p>Sign in to manage recruitment and candidate applications.</p>
        </div>

        {error && (
          <div className="hr-login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <div className="hr-login-field">
            <label>Official Email Address</label>
            <div className="hr-input-wrapper">
              <Mail size={19} />
              <input
                type="email"
                placeholder="Enter your HR email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="hr-login-field">
            <label>Password</label>
            <div className="hr-input-wrapper">
              <LockKeyhole size={19} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="hr-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="hr-login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <p className="hr-login-footer">
          Authorized Drishtee HR personnel only.
        </p>

      </div>
    </div>
  );
}

export default HRLogin;
