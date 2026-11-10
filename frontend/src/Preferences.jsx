
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Building2,
  BriefcaseBusiness,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

import "./Preferences.css";

const initialForm = {
  preferred_location: "",
  preferred_entity_id: "",
  preferred_department: "",
  employment_type: "",
  hiring_category: "",
  willing_to_relocate: false,
  expected_salary: "",
  notice_period: ""
};

function Preferences() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Load entities and saved preferences
  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("candidateToken");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [entityResponse, preferenceResponse] =
          await Promise.all([
            fetch("http://localhost:5000/api/entities"),
            fetch("http://localhost:5000/api/profile/preferences", {
              headers
            })
          ]);

        if (!entityResponse.ok || !preferenceResponse.ok) {
          throw new Error("Unable to load preferences.");
        }

        const entityData = await entityResponse.json();
        const preferenceData = await preferenceResponse.json();

        setEntities(
          Array.isArray(entityData)
            ? entityData
            : entityData.data || []
        );

        if (preferenceData.data) {
          setFormData({
            ...initialForm,
            ...preferenceData.data,
            preferred_entity_id:
              preferenceData.data.preferred_entity_id
                ? String(preferenceData.data.preferred_entity_id)
                : "",
            expected_salary:
              preferenceData.data.expected_salary ?? "",
            willing_to_relocate:
              Boolean(preferenceData.data.willing_to_relocate)
          });
        }
      } catch (error) {
        console.error("Preferences Loading Error:", error);
        setMessage(error.message);
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setMessage("");

      const token = sessionStorage.getItem("candidateToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/profile/preferences",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            ...formData,
            preferred_entity_id:
              formData.preferred_entity_id || null,
            expected_salary:
              formData.expected_salary || null
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save preferences."
        );
      }

      setMessage("Preferences saved successfully!");
      setMessageType("success");

      setTimeout(() => {
        navigate("/resume");
      }, 1000);

    } catch (error) {
      console.error("Preferences Saving Error:", error);
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="preferences-loading">
        Loading your preferences...
      </div>
    );
  }

  return (
    <div className="preferences-page">

      <div className="preferences-header">
        <span className="preferences-eyebrow">
          DRISHTEE CAREERS
        </span>
        <h1>Complete Your Candidate Profile</h1>
        <p>
          Tell us about your career interests and job preferences.
        </p>
      </div>

      {/* Progress */}
      <div className="preferences-progress">
        {[
          "Personal",
          "Education",
          "Experience",
          "Preferences",
          "Resume",
          "Review"
        ].map((step, index) => (
          <div className="preferences-progress-item" key={step}>
            <div
              className={`preferences-progress-step ${
                index < 3 ? "completed" : ""
              } ${index === 3 ? "active" : ""}`}
            >
              <span>{index < 3 ? "✓" : index + 1}</span>
              <p>{step}</p>
            </div>
            {index !== 5 && (
              <div className="preferences-progress-line" />
            )}
          </div>
        ))}
      </div>

      <form
        className="preferences-form-card"
        onSubmit={handleSubmit}
      >
        <div className="preferences-section-heading">
          <div className="preferences-icon">
            <BriefcaseBusiness size={24} />
          </div>
          <div>
            <h2>Career Preferences</h2>
            <p>
              Help us understand the opportunities you are looking for.
            </p>
          </div>
        </div>

        <div className="preferences-form-grid">

          <div className="preferences-field">
            <label>
              <MapPin size={16} />
              Preferred Job Location *
            </label>
            <input
              type="text"
              name="preferred_location"
              value={formData.preferred_location}
              onChange={handleChange}
              placeholder="e.g. Patna, Bihar"
              maxLength={255}
              required
            />
          </div>

          <div className="preferences-field">
            <label>
              <Building2 size={16} />
              Preferred Drishtee Entity
            </label>
            <select
              name="preferred_entity_id"
              value={formData.preferred_entity_id}
              onChange={handleChange}
            >
              <option value="">Any entity</option>
              {entities.map((entity) => (
                <option
                  key={entity.entity_id}
                  value={entity.entity_id}
                >
                  {entity.entity_name}
                </option>
              ))}
            </select>
          </div>

          <div className="preferences-field">
            <label>Preferred Department *</label>
            <select
              name="preferred_department"
              value={formData.preferred_department}
              onChange={handleChange}
              required
            >
              <option value="">Select department</option>
              <option value="Technology">Technology / IT</option>
              <option value="Operations">Operations</option>
              <option value="Rural Development">Rural Development</option>
              <option value="Finance">Finance & Accounts</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Sales and Marketing">Sales & Marketing</option>
              <option value="Skill Development">Skill Development</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="preferences-field">
            <label>Employment Type *</label>
            <select
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              required
            >
              <option value="">Select employment type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Internship">Internship</option>
              <option value="Contract">Contract</option>
              <option value="Project-based">Project-based</option>
            </select>
          </div>

          <div className="preferences-field">
            <label>Recruitment Category *</label>
            <select
              name="hiring_category"
              value={formData.hiring_category}
              onChange={handleChange}
              required
            >
              <option value="">Select recruitment category</option>
              <option value="Gram Vidushi and Vidushi Fellows">
                Gram Vidushi and Vidushi Fellows
              </option>
              <option value="Maan Vidushi">
                Maan Vidushi
              </option>
              <option value="Lateral Hiring">
                Lateral Hiring
              </option>
            </select>
          </div>

          <div className="preferences-field">
            <label>Notice Period</label>
            <select
              name="notice_period"
              value={formData.notice_period}
              onChange={handleChange}
            >
              <option value="">Select notice period</option>
              <option value="Immediate">Immediate</option>
              <option value="15 Days">15 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="45 Days">45 Days</option>
              <option value="60 Days">60 Days</option>
              <option value="90 Days">90 Days</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="preferences-field">
            <label>Expected Annual Salary (₹)</label>
            <input
              type="number"
              name="expected_salary"
              value={formData.expected_salary}
              onChange={handleChange}
              placeholder="e.g. 300000"
              min="0"
              step="1000"
            />
          </div>

        </div>

        <div className="preferences-relocation">
          <div>
            <strong>Willing to Relocate?</strong>
            <p>
              Are you comfortable moving to another city for work?
            </p>
          </div>

          <label className="preferences-toggle">
            <input
              type="checkbox"
              name="willing_to_relocate"
              checked={formData.willing_to_relocate}
              onChange={handleChange}
            />
            <span>
              {formData.willing_to_relocate ? "Yes" : "No"}
            </span>
          </label>
        </div>

        {message && (
          <div
            className={`preferences-message ${messageType}`}
            role="alert"
          >
            {message}
          </div>
        )}

        <div className="preferences-actions">
          <button
            type="button"
            className="preferences-back-button"
            onClick={() => navigate("/experience-details")}
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <button
            type="submit"
            className="preferences-next-button"
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

export default Preferences;
