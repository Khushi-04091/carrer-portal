
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

import "./CandidateProfile.css";

function CandidateProfile() {
  const navigate = useNavigate();

  // Get logged-in candidate information
  const getSavedCandidate = () => {
    try {
      return JSON.parse(
        sessionStorage.getItem("candidate") || "{}"
      );
    } catch {
      return {};
    }
  };

  // Personal information form state
  const [formData, setFormData] = useState(() => {
    const candidate = getSavedCandidate();

    return {
      full_name: candidate.full_name || "",
      date_of_birth: "",
      gender: "",
      email: candidate.email || "",
      phone: candidate.phone || "",

      current_address: "",
      current_city: "",
      current_state: "",
      current_pincode: "",

      permanent_address: "",
      permanent_city: "",
      permanent_state: "",
      permanent_pincode: ""
    };
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Fetch previously saved personal details automatically
  useEffect(() => {
    const fetchPersonalDetails = async () => {
      try {
        const token = sessionStorage.getItem("candidateToken");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/profile/personal",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("candidateToken");
            sessionStorage.removeItem("candidate");
            navigate("/login");
            return;
          }

          throw new Error(
            data.message || "Unable to load personal details."
          );
        }

        const personal = data.data;

        // Automatically populate the form
        setFormData((previous) => ({
          ...previous,

          full_name: personal.full_name || "",
          date_of_birth: personal.date_of_birth || "",
          gender: personal.gender || "",
          email: personal.email || "",
          phone: personal.phone || "",

          current_address: personal.current_address || "",
          current_city: personal.current_city || "",
          current_state: personal.current_state || "",
          current_pincode: personal.current_pincode || "",

          permanent_address: personal.permanent_address || "",
          permanent_city: personal.permanent_city || "",
          permanent_state: personal.permanent_state || "",
          permanent_pincode: personal.permanent_pincode || ""
        }));

        // Keep candidate information updated in session storage
        const existingCandidate = getSavedCandidate();

        sessionStorage.setItem(
          "candidate",
          JSON.stringify({
            ...existingCandidate,
            full_name:
              personal.full_name || existingCandidate.full_name,
            email:
              personal.email || existingCandidate.email,
            phone:
              personal.phone || existingCandidate.phone
          })
        );

        // Notify Navbar and other components
        window.dispatchEvent(
          new Event("candidateAuthChanged")
        );

      } catch (error) {
        console.error(
          "Personal Details Loading Error:",
          error
        );

        setMessage(error.message);
        setMessageType("error");
      }
    };

    fetchPersonalDetails();
  }, [navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // Save personal information
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setMessage("");
      setMessageType("");

      const token = sessionStorage.getItem("candidateToken");

      if (!token) {
        setMessage(
          "Your login session has expired. Please log in again."
        );
        setMessageType("error");
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/profile/personal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            full_name: formData.full_name.trim(),
            date_of_birth: formData.date_of_birth,
            gender: formData.gender,

            current_address: formData.current_address.trim(),
            current_city: formData.current_city.trim(),
            current_state: formData.current_state.trim(),
            current_pincode: formData.current_pincode,

            permanent_address: formData.permanent_address.trim(),
            permanent_city: formData.permanent_city.trim(),
            permanent_state: formData.permanent_state.trim(),
            permanent_pincode: formData.permanent_pincode
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save your information."
        );
      }

      // Update candidate information in session storage
      const existingCandidate = getSavedCandidate();

      const updatedCandidate = {
        ...existingCandidate,
        full_name: formData.full_name.trim()
      };

      sessionStorage.setItem(
        "candidate",
        JSON.stringify(updatedCandidate)
      );

      // Notify Navbar and other components
      window.dispatchEvent(
        new Event("candidateAuthChanged")
      );

      setMessage(
        "Personal information saved successfully!"
      );
      setMessageType("success");

      // Move to Education Details after successful saving
      setTimeout(() => {
        navigate("/education-details");
      }, 1000);

    } catch (error) {
      console.error(
        "Profile submission error:",
        error
      );

      setMessage(
        error.message || "Something went wrong. Please try again."
      );

      setMessageType("error");

    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="candidate-profile-page">

      {/* Page Header */}
      <div className="profile-header">

        <span className="profile-eyebrow">
          DRISHTEE CAREERS
        </span>

        <h1>Complete Your Candidate Profile</h1>

        <p>
          Tell us about yourself. Your profile will be used
          for your future applications at Drishtee.
        </p>

      </div>

      {/* Progress Steps */}
      <div className="profile-progress">

        <div className="progress-step active">
          <span>1</span>
          <p>Personal</p>
        </div>

        <div className="progress-line"></div>

        <div className="progress-step">
          <span>2</span>
          <p>Education</p>
        </div>

        <div className="progress-line"></div>

        <div className="progress-step">
          <span>3</span>
          <p>Experience</p>
        </div>

        <div className="progress-line"></div>

        <div className="progress-step">
          <span>4</span>
          <p>Preferences</p>
        </div>

        <div className="progress-line"></div>

        <div className="progress-step">
          <span>5</span>
          <p>Resume</p>
        </div>

        <div className="progress-line"></div>

        <div className="progress-step">
          <span>6</span>
          <p>Review</p>
        </div>

      </div>

      {/* Personal Information Form */}
      <form
        className="profile-form-card"
        onSubmit={handleSubmit}
      >

        {/* Section Heading */}
        <div className="profile-section-title">

          <div className="profile-icon">
            <UserRound size={23} />
          </div>

          <div>
            <h2>Personal Information</h2>

            <p>
              Enter your details as they appear on your
              official documents.
            </p>
          </div>

        </div>

        {/* Basic Information */}
        <div className="profile-form-grid">

          <div className="profile-field">
            <label>Full Name *</label>

            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              maxLength={150}
              required
            />
          </div>

          <div className="profile-field">
            <label>Date of Birth *</label>

            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="profile-field">
            <label>Email Address</label>

            <input
              type="email"
              value={formData.email}
              disabled
            />

            <small>
              Your registered email address
            </small>
          </div>

          <div className="profile-field">
            <label>Mobile Number</label>

            <input
              type="tel"
              value={formData.phone}
              disabled
            />

            <small>
              Your registered mobile number
            </small>
          </div>

          <div className="profile-field">
            <label>Gender</label>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">
                Prefer not to say
              </option>
            </select>
          </div>

        </div>

        {/* Current Address */}
        <div className="profile-subsection">

          <h3>Current Address</h3>

          <div className="profile-form-grid">

            <div className="profile-field full-width">
              <label>Address *</label>

              <textarea
                name="current_address"
                value={formData.current_address}
                onChange={handleChange}
                placeholder="House number, street, area"
                maxLength={1000}
                required
              />
            </div>

            <div className="profile-field">
              <label>City *</label>

              <input
                type="text"
                name="current_city"
                value={formData.current_city}
                onChange={handleChange}
                placeholder="Enter city"
                required
              />
            </div>

            <div className="profile-field">
              <label>State *</label>

              <input
                type="text"
                name="current_state"
                value={formData.current_state}
                onChange={handleChange}
                placeholder="Enter state"
                required
              />
            </div>

            <div className="profile-field">
              <label>PIN Code *</label>

              <input
                type="text"
                name="current_pincode"
                value={formData.current_pincode}
                onChange={handleChange}
                placeholder="6-digit PIN code"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
              />
            </div>

          </div>

        </div>

        {/* Permanent Address */}
        <div className="profile-subsection">

          <h3>Permanent Address</h3>

          <div className="profile-form-grid">

            <div className="profile-field full-width">
              <label>Address *</label>

              <textarea
                name="permanent_address"
                value={formData.permanent_address}
                onChange={handleChange}
                placeholder="House number, street, area"
                maxLength={1000}
                required
              />
            </div>

            <div className="profile-field">
              <label>City *</label>

              <input
                type="text"
                name="permanent_city"
                value={formData.permanent_city}
                onChange={handleChange}
                placeholder="Enter city"
                required
              />
            </div>

            <div className="profile-field">
              <label>State *</label>

              <input
                type="text"
                name="permanent_state"
                value={formData.permanent_state}
                onChange={handleChange}
                placeholder="Enter state"
                required
              />
            </div>

            <div className="profile-field">
              <label>PIN Code *</label>

              <input
                type="text"
                name="permanent_pincode"
                value={formData.permanent_pincode}
                onChange={handleChange}
                placeholder="6-digit PIN code"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]{6}"
                required
              />
            </div>

          </div>

        </div>

        {/* Success and Error Messages */}
        {message && (
          <div
            className={`profile-message ${messageType}`}
            role="alert"
          >
            {message}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="profile-actions">

          <button
            type="button"
            className="profile-back-button"
            onClick={() => navigate("/jobs")}
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <button
            type="submit"
            className="profile-next-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save & Continue"}
            <ArrowRight size={17} />
          </button>

        </div>

      </form>

    </div>
  );
}

export default CandidateProfile;
