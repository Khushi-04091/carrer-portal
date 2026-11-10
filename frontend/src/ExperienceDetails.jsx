
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2
} from "lucide-react";

import "./ExperienceDetails.css";

const emptyExperience = () => ({
  organisation_name: "",
  job_title: "",
  employment_type: "Full-time",
  start_date: "",
  end_date: "",
  currently_working: false,
  description: ""
});

function ExperienceDetails() {
  const navigate = useNavigate();

  const [experienceType, setExperienceType] = useState("");
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Load saved experience details
  useEffect(() => {
    const fetchExperience = async () => {
      try {
        const token = sessionStorage.getItem("candidateToken");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/profile/experience",
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
            data.message || "Unable to load experience details."
          );
        }

        setExperienceType(data.experience_type || "");

        setExperiences(
          Array.isArray(data.data)
            ? data.data.map((item) => ({
                experience_id: item.experience_id,
                organisation_name: item.organisation_name || "",
                job_title: item.job_title || "",
                employment_type: item.employment_type || "Full-time",
                start_date: item.start_date || "",
                end_date: item.end_date || "",
                currently_working: Boolean(item.currently_working),
                description: item.description || ""
              }))
            : []
        );

      } catch (error) {
        console.error("Experience Loading Error:", error);
        setMessage(error.message);
        setMessageType("error");

      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [navigate]);

  // Select Fresher or Experienced
  const handleExperienceTypeChange = (value) => {
    setExperienceType(value);
    setMessage("");

    if (value === "Fresher") {
      setExperiences([]);
    } else if (experiences.length === 0) {
      setExperiences([emptyExperience()]);
    }
  };

  // Add another experience
  const addExperience = () => {
    setExperiences((previous) => [
      ...previous,
      emptyExperience()
    ]);
  };

  // Remove experience
  const removeExperience = (index) => {
    setExperiences((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  // Handle input changes
  const handleChange = (index, e) => {
    const { name, value, type, checked } = e.target;

    setExperiences((previous) =>
      previous.map((item, i) =>
        i === index
          ? {
              ...item,
              [name]: type === "checkbox" ? checked : value,
              ...(name === "currently_working" && checked
                ? { end_date: "" }
                : {})
            }
          : item
      )
    );
  };

  // Save experience details
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (!experienceType) {
      setMessage("Please select your experience level.");
      setMessageType("error");
      return;
    }

    if (
      experienceType === "Experienced" &&
      experiences.length === 0
    ) {
      setMessage("Please add at least one work experience.");
      setMessageType("error");
      return;
    }

    // Validate experience records
    if (experienceType === "Experienced") {
      for (let i = 0; i < experiences.length; i++) {
        const item = experiences[i];

        if (
          !item.organisation_name.trim() ||
          !item.job_title.trim() ||
          !item.start_date
        ) {
          setMessage(
            `Please complete the required fields in Experience ${i + 1}.`
          );
          setMessageType("error");
          return;
        }

        if (!item.currently_working && !item.end_date) {
          setMessage(
            `Please enter the end date in Experience ${i + 1}.`
          );
          setMessageType("error");
          return;
        }

        if (
          item.end_date &&
          item.end_date < item.start_date
        ) {
          setMessage(
            `End date cannot be before start date in Experience ${i + 1}.`
          );
          setMessageType("error");
          return;
        }
      }
    }

    try {
      setSaving(true);
      setMessage("");
      setMessageType("");

      const token = sessionStorage.getItem("candidateToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/profile/experience",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            experience_type: experienceType,
            experiences:
              experienceType === "Experienced"
                ? experiences
                : []
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save experience details."
        );
      }

      setMessage("Experience details saved successfully!");
      setMessageType("success");

      // Go to Step 4 after successful saving
      setTimeout(() => {
        navigate("/preferences");
      }, 1000);

    } catch (error) {
      console.error("Experience Saving Error:", error);
      setMessage(error.message);
      setMessageType("error");

    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="experience-loading">
        Loading your experience details...
      </div>
    );
  }

  return (
    <div className="experience-page">

      {/* Header */}
      <div className="experience-header">
        <span className="experience-eyebrow">
          DRISHTEE CAREERS
        </span>

        <h1>Experience Details</h1>

        <p>
          Tell us about your professional journey, internships
          and work experience.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="experience-progress">
        {[
          "Personal",
          "Education",
          "Experience",
          "Preferences",
          "Resume",
          "Review"
        ].map((step, index) => (
          <div
            className="experience-progress-item"
            key={step}
          >
            <div
              className={`experience-progress-step ${
                index < 2 ? "completed" : ""
              } ${index === 2 ? "active" : ""}`}
            >
              <span>
                {index < 2 ? "✓" : index + 1}
              </span>
              <p>{step}</p>
            </div>

            {index !== 5 && (
              <div className="experience-progress-line"></div>
            )}
          </div>
        ))}
      </div>

      {/* Main Form */}
      <form
        className="experience-form-card"
        onSubmit={handleSubmit}
      >

        <div className="experience-section-heading">
          <div className="experience-icon">
            <BriefcaseBusiness size={24} />
          </div>

          <div>
            <h2>Professional Experience</h2>
            <p>
              Select your current professional status.
            </p>
          </div>
        </div>

        {/* Experience Type */}
        <div className="experience-type-section">
          <label className="experience-label">
            What is your experience level? *
          </label>

          <div className="experience-type-options">

            <button
              type="button"
              className={`experience-type-card ${
                experienceType === "Fresher" ? "selected" : ""
              }`}
              onClick={() =>
                handleExperienceTypeChange("Fresher")
              }
            >
              <span className="experience-type-emoji">🎓</span>
              <strong>Fresher</strong>
              <small>
                I am a student or have no previous work experience.
              </small>
            </button>

            <button
              type="button"
              className={`experience-type-card ${
                experienceType === "Experienced" ? "selected" : ""
              }`}
              onClick={() =>
                handleExperienceTypeChange("Experienced")
              }
            >
              <span className="experience-type-emoji">💼</span>
              <strong>Experienced</strong>
              <small>
                I have worked in a company or completed internships.
              </small>
            </button>

          </div>
        </div>

        {/* Fresher Message */}
        {experienceType === "Fresher" && (
          <div className="fresher-message">
            <strong>Welcome, Fresher!</strong>
            <p>
              No previous work experience is required.
              You can continue to the next section.
            </p>
          </div>
        )}

        {/* Experienced Candidate Form */}
        {experienceType === "Experienced" && (
          <div className="experience-records">

            <div className="experience-records-header">
              <div>
                <h3>Work Experience</h3>
                <p>
                  Add your current and previous employment or internships.
                </p>
              </div>

              <button
                type="button"
                className="add-experience-button"
                onClick={addExperience}
              >
                <Plus size={17} />
                Add Another
              </button>
            </div>

            {experiences.map((item, index) => (
              <div
                className="experience-record-card"
                key={item.experience_id || `new-${index}`}
              >

                <div className="experience-record-title">
                  <h3>Experience {index + 1}</h3>

                  <button
                    type="button"
                    className="remove-experience-button"
                    onClick={() => removeExperience(index)}
                  >
                    <Trash2 size={17} />
                    Remove
                  </button>
                </div>

                <div className="experience-form-grid">

                  <div className="experience-field">
                    <label>Company / Organisation Name *</label>
                    <input
                      type="text"
                      name="organisation_name"
                      value={item.organisation_name}
                      onChange={(e) => handleChange(index, e)}
                      placeholder="Enter company name"
                      maxLength={255}
                      required
                    />
                  </div>

                  <div className="experience-field">
                    <label>Job Title / Designation *</label>
                    <input
                      type="text"
                      name="job_title"
                      value={item.job_title}
                      onChange={(e) => handleChange(index, e)}
                      placeholder="e.g. Software Developer"
                      maxLength={150}
                      required
                    />
                  </div>

                  <div className="experience-field">
                    <label>Employment Type</label>
                    <select
                      name="employment_type"
                      value={item.employment_type}
                      onChange={(e) => handleChange(index, e)}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>

                  <div className="experience-field">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      name="start_date"
                      value={item.start_date}
                      onChange={(e) => handleChange(index, e)}
                      max={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="experience-field">
                    <label>
                      End Date {!item.currently_working && "*"}
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={item.end_date}
                      onChange={(e) => handleChange(index, e)}
                      min={item.start_date || undefined}
                      max={new Date().toISOString().split("T")[0]}
                      disabled={item.currently_working}
                      required={!item.currently_working}
                    />
                  </div>

                </div>

                <label className="currently-working-checkbox">
                  <input
                    type="checkbox"
                    name="currently_working"
                    checked={item.currently_working}
                    onChange={(e) => handleChange(index, e)}
                  />
                  I currently work here
                </label>

                <div className="experience-field experience-description">
                  <label>Roles and Responsibilities</label>
                  <textarea
                    name="description"
                    value={item.description}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="Describe your responsibilities, projects and achievements..."
                    rows={4}
                    maxLength={3000}
                  />
                </div>

              </div>
            ))}

            <button
              type="button"
              className="add-another-bottom"
              onClick={addExperience}
            >
              <Plus size={17} />
              Add Another Experience
            </button>

          </div>
        )}

        {/* Success / Error Message */}
        {message && (
          <div
            className={`experience-message ${messageType}`}
            role="alert"
          >
            {message}
          </div>
        )}

        {/* Navigation */}
        <div className="experience-actions">

          <button
            type="button"
            className="experience-back-button"
            onClick={() => navigate("/education-details")}
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <button
            type="submit"
            className="experience-next-button"
            disabled={saving || !experienceType}
          >
            {saving ? "Saving..." : "Save & Continue"}
            <ArrowRight size={17} />
          </button>

        </div>

      </form>
    </div>
  );
}

export default ExperienceDetails;
