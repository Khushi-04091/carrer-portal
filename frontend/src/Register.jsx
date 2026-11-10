
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle
} from "lucide-react";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    setError("");
    setSuccess("");
  };

  // Handle registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Validate full name
    if (!formData.full_name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    // Validate Indian mobile number
    const phonePattern = /^[6-9]\d{9}$/;

    if (!phonePattern.test(formData.phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Validate password
    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            full_name: formData.full_name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            password: formData.password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setSuccess(
        "Your account has been created successfully! You can now log in."
      );

      // Clear form after successful registration
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
      });

    } catch (err) {
      console.error("Registration error:", err);

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
            YOUR JOURNEY STARTS HERE
          </span>

          <h1>
            Build your future.
            <span>Create an impact.</span>
          </h1>

          <p>
            Join Drishtee and become part of a team working
            towards empowering rural communities and creating
            sustainable livelihoods.
          </p>

          <div className="auth-highlight">

            <div className="auth-highlight-icon">
              <UserRound size={24} />
            </div>

            <div>
              <strong>One account, many opportunities.</strong>

              <span>
                Explore careers across Drishtee organisations.
              </span>
            </div>

          </div>
        </div>

        {/* REGISTRATION FORM */}

        <div className="auth-form-card">

          <div className="auth-form-heading">

            <span className="section-label">
              CANDIDATE REGISTRATION
            </span>

            <h2>Create your account</h2>

            <p>
              Enter your details to get started.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* FULL NAME */}

            <div className="auth-field">

              <label htmlFor="full_name">
                Full name
              </label>

              <div className="auth-input-wrapper">

                <UserRound size={18} />

                <input
                  id="full_name"
                  type="text"
                  name="full_name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />

              </div>
            </div>

            {/* EMAIL */}

            <div className="auth-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="auth-input-wrapper">

                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />

              </div>
            </div>

            {/* PHONE */}

            <div className="auth-field">

              <label htmlFor="phone">
                Mobile number
              </label>

              <div className="auth-input-wrapper">

                <Phone size={18} />

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter your 10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  pattern="[6-9][0-9]{9}"
                  autoComplete="tel"
                />

              </div>
            </div>

            {/* PASSWORD */}

            <div className="auth-field">

              <label htmlFor="password">
                Password
              </label>

              <div className="auth-input-wrapper">

                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
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

            {/* CONFIRM PASSWORD */}

            <div className="auth-field">

              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div className="auth-input-wrapper">

                <LockKeyhole size={18} />

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>

            {/* PRIVACY POLICY */}

            <label className="auth-checkbox">

              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the privacy policy and terms of use.
              </span>

            </label>

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

            {/* SUBMIT BUTTON */}

            <button
              type="submit"
              className="auth-submit-button"
              disabled={loading}
            >

              {loading ? "Creating Account..." : "Create Account"}

              {!loading && <ArrowRight size={18} />}

            </button>

          </form>

          {/* LOGIN LINK */}

          <div className="auth-switch">

            Already have an account?

            <Link to="/login">
              {" "}Login
            </Link>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;
