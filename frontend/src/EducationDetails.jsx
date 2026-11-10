
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  BookOpen
} from "lucide-react";

import "./EducationDetails.css";

const createEducation = () => ({
  education_id: null,
  qualification_level: "",
  institution_name: "",
  board_or_university: "",
  degree_or_stream: "",
  roll_number: "",
  passing_year: "",
  result_type: "percentage",
  percentage: "",
  cgpa: ""
});

function EducationDetails() {
  const navigate = useNavigate();

  const [educationList, setEducationList] = useState([
    createEducation()
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Load previously saved education details
  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const token = sessionStorage.getItem("candidateToken");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/profile/education",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load education details."
          );
        }

        const records = Array.isArray(data.data) ? data.data : [];

        if (records.length > 0) {
          const formattedRecords = records.map((item) => ({
            education_id: item.education_id,
            qualification_level: item.qualification_level || "",
            institution_name: item.institution_name || "",
            board_or_university: item.board_or_university || "",
            degree_or_stream: item.degree_or_stream || "",
            roll_number: item.roll_number || "",
            passing_year: item.passing_year
              ? String(item.passing_year).slice(0, 4)
              : "",
            result_type:
              item.cgpa !== null && item.cgpa !== undefined
                ? "cgpa"
                : "percentage",
            percentage:
              item.percentage !== null && item.percentage !== undefined
                ? String(item.percentage)
                : "",
            cgpa:
              item.cgpa !== null && item.cgpa !== undefined
                ? String(item.cgpa)
                : ""
          }));

          setEducationList(formattedRecords);
        } else {
          setEducationList([createEducation()]);
        }

      } catch (error) {
        console.error("Education Loading Error:", error);
        setMessage(error.message);
        setMessageType("error");

      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
  }, [navigate]);

  // Update an education record
  const handleChange = (index, e) => {
    const { name, value } = e.target;

    setEducationList((previous) =>
      previous.map((item, i) =>
        i === index ? { ...item, [name]: value } : item
      )
    );
  };

  // Add another qualification
  const addEducation = () => {
    setEducationList((previous) => [
      ...previous,
      createEducation()
    ]);

    setMessage("");
  };

  // Remove a qualification from the current form
  const removeEducation = (index) => {
    if (educationList.length === 1) {
      setMessage("At least one education record is required.");
      setMessageType("error");
      return;
    }

    setEducationList((previous) =>
      previous.filter((_, i) => i !== index)
    );

    setMessage("");
  };

  // Save education information
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setMessage("");
      setMessageType("");

      const token = sessionStorage.getItem("candidateToken");

      if (!token) {
        navigate("/login");
        return;
      }

      // Check for duplicate qualification levels
      const levels = educationList.map(
        (item) => item.qualification_level
      );

      if (new Set(levels).size !== levels.length) {
        throw new Error(
          "Please select each qualification level only once."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/profile/education",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            education: educationList
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save education details."
        );
      }

      // Fetch the latest saved records
      const refreshResponse = await fetch(
        "http://localhost:5000/api/profile/education",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const refreshData = await refreshResponse.json();

      if (
        refreshResponse.ok &&
        Array.isArray(refreshData.data)
      ) {
        const updatedRecords = refreshData.data.map((item) => ({
          education_id: item.education_id,
          qualification_level: item.qualification_level || "",
          institution_name: item.institution_name || "",
          board_or_university: item.board_or_university || "",
          degree_or_stream: item.degree_or_stream || "",
          roll_number: item.roll_number || "",
          passing_year: item.passing_year
            ? String(item.passing_year).slice(0, 4)
            : "",
          result_type:
            item.cgpa !== null && item.cgpa !== undefined
              ? "cgpa"
              : "percentage",
          percentage:
            item.percentage !== null && item.percentage !== undefined
              ? String(item.percentage)
              : "",
          cgpa:
            item.cgpa !== null && item.cgpa !== undefined
              ? String(item.cgpa)
              : ""
        }));

        if (updatedRecords.length > 0) {
          setEducationList(updatedRecords);
        }
      }

      // Show success message
      setMessage("Education details saved successfully!");
      setMessageType("success");

      // Navigate to Experience Details
      setTimeout(() => {
        navigate("/experience-details");
      }, 1000);

    } catch (error) {
      console.error("Education Save Error:", error);

      setMessage(error.message);
      setMessageType("error");

    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="education-page">

      {/* Header */}
      <div className="education-header">
        <span className="education-eyebrow">
          DRISHTEE CAREERS
        </span>

        <h1>Complete Your Candidate Profile</h1>

        <p>
          Add your academic qualifications and educational
          achievements.
        </p>
      </div>

      {/* Progress */}
      <div className="education-progress">

        <div className="education-progress-step completed">
          <span>✓</span>
          <p>Personal</p>
        </div>

        <div className="education-progress-line active"></div>

        <div className="education-progress-step active">
          <span>2</span>
          <p>Education</p>
        </div>

        <div className="education-progress-line"></div>

        <div className="education-progress-step">
          <span>3</span>
          <p>Experience</p>
        </div>

        <div className="education-progress-line"></div>

        <div className="education-progress-step">
          <span>4</span>
          <p>Preferences</p>
        </div>

        <div className="education-progress-line"></div>

        <div className="education-progress-step">
          <span>5</span>
          <p>Resume</p>
        </div>

        <div className="education-progress-line"></div>

        <div className="education-progress-step">
          <span>6</span>
          <p>Review</p>
        </div>

      </div>

      {/* Education Form */}
      <form
        className="education-form-card"
        onSubmit={handleSubmit}
      >

        <div className="education-section-heading">

          <div className="education-icon">
            <GraduationCap size={25} />
          </div>

          <div>
            <h2>Education Information</h2>
            <p>
              Provide your academic details starting from Class 10.
            </p>
          </div>

        </div>

        {loading ? (
          <p className="education-note">
            Loading your saved education details...
          </p>
        ) : (
          <>
            {educationList.map((education, index) => (

              <div
                className="education-record"
                key={education.education_id || `new-${index}`}
              >

                <div className="education-record-heading">

                  <div className="education-record-title">
                    <BookOpen size={19} />
                    <h3>Qualification {index + 1}</h3>
                  </div>

                  {educationList.length > 1 && (
                    <button
                      type="button"
                      className="education-remove-button"
                      onClick={() => removeEducation(index)}
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  )}

                </div>

                <div className="education-form-grid">

                  <div className="education-field">
                    <label>Qualification Level *</label>

                    <select
                      name="qualification_level"
                      value={education.qualification_level}
                      onChange={(e) => handleChange(index, e)}
                      required
                      disabled={Boolean(education.education_id)}
                    >
                      <option value="">Select qualification</option>
                      <option value="Class 10">Class 10</option>
                      <option value="Class 12">Class 12</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Graduation">Graduation</option>
                      <option value="Post Graduation">Post Graduation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="education-field">
                    <label>School / College Name *</label>

                    <input
                      type="text"
                      name="institution_name"
                      value={education.institution_name}
                      onChange={(e) => handleChange(index, e)}
                      placeholder="Enter school or college name"
                      required
                      maxLength={255}
                    />
                  </div>

                  <div className="education-field">
                    <label>Board / University *</label>

                    <input
                      type="text"
                      name="board_or_university"
                      value={education.board_or_university}
                      onChange={(e) => handleChange(index, e)}
                      placeholder="e.g. CBSE, ICSE, JAC, AKTU"
                      required
                      maxLength={255}
                    />
                  </div>

                  <div className="education-field">
                    <label>Stream / Degree / Branch *</label>

                    <input
                      type="text"
                      name="degree_or_stream"
                      value={education.degree_or_stream}
                      onChange={(e) => handleChange(index, e)}
                      placeholder="e.g. Science, B.Tech - IT, B.Com"
                      required
                      maxLength={150}
                    />
                  </div>

                  <div className="education-field">
                    <label>Roll / Registration Number *</label>

                    <input
                      type="text"
                      name="roll_number"
                      value={education.roll_number}
                      onChange={(e) => handleChange(index, e)}
                      placeholder="Enter examination roll number"
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="education-field">
                    <label>Passing Year *</label>

                    <input
                      type="number"
                      name="passing_year"
                      value={education.passing_year}
                      onChange={(e) => handleChange(index, e)}
                      placeholder="e.g. 2024"
                      min="1950"
                      max="2100"
                      required
                    />
                  </div>

                  <div className="education-field">
                    <label>Result Type *</label>

                    <select
                      name="result_type"
                      value={education.result_type}
                      onChange={(e) => handleChange(index, e)}
                      required
                    >
                      <option value="percentage">Percentage</option>
                      <option value="cgpa">CGPA</option>
                    </select>
                  </div>

                  {education.result_type === "percentage" ? (

                    <div className="education-field">
                      <label>Percentage *</label>

                      <input
                        type="number"
                        name="percentage"
                        value={education.percentage}
                        onChange={(e) => handleChange(index, e)}
                        placeholder="e.g. 85.5"
                        min="0"
                        max="100"
                        step="0.01"
                        required
                      />
                    </div>

                  ) : (

                    <div className="education-field">
                      <label>CGPA *</label>

                      <input
                        type="number"
                        name="cgpa"
                        value={education.cgpa}
                        onChange={(e) => handleChange(index, e)}
                        placeholder="e.g. 8.5"
                        min="0"
                        max="10"
                        step="0.01"
                        required
                      />
                    </div>

                  )}

                </div>

              </div>

            ))}

            <button
              type="button"
              className="education-add-button"
              onClick={addEducation}
            >
              <Plus size={18} />
              Add Another Qualification
            </button>

            <p className="education-note">
              Add all your completed qualifications. You can add
              Class 10, Class 12, Diploma, Graduation and
              Post-Graduation records.
            </p>
          </>
        )}

        {/* Success and Error Messages */}
        {message && (
          <div className={`education-message ${messageType}`}>
            {message}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="education-actions">

          <button
            type="button"
            className="education-back-button"
            onClick={() => navigate("/your-career")}
          >
            <ArrowLeft size={17} />
            Previous
          </button>

          <button
            type="submit"
            className="education-next-button"
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save & Continue"}
            <ArrowRight size={17} />
          </button>

        </div>

      </form>
    </div>
  );
}

export default EducationDetails;
