
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  Send,
  LoaderCircle
} from "lucide-react";
import "./ReviewApplication.css";

const API_URL = "https://carrer-portal-dpo8.onrender.com";

function ReviewApplication() {
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = sessionStorage.getItem("candidateToken");

  useEffect(() => {
    const fetchReview = async () => {
      try {
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(`${API_URL}/api/profile/review`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load application details.");
        }

        setApplication(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [token, navigate]);

  const handleSubmit = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to submit your application profile?"
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/api/profile/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Application submission failed.");
      }

      setSuccess("Your profile has been submitted successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const showValue = (value) => {
    return value !== null && value !== undefined && value !== ""
      ? value
      : "Not provided";
  };

  if (loading) {
    return (
      <div className="review-loading">
        <LoaderCircle className="spin-icon" size={28} />
        <p>Loading your application...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="review-container">
        <p className="review-error">
          {error || "Application details could not be loaded."}
        </p>
        <button onClick={() => navigate("/your-career")}>
          Go to Profile
        </button>
      </div>
    );
  }

  const { personal, education, experience, preferences, resume } = application;

  return (
    <div className="review-container">
      <div className="review-header">
        <span className="review-eyebrow">FINAL STEP</span>
        <h1>Review Your Application</h1>
        <p>
          Please check your information carefully before submitting your
          candidate profile.
        </p>
      </div>

      {error && (
        <div className="review-message error-message">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="review-message success-message">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      <section className="review-card">
        <div className="review-card-heading">
          <User />
          <h2>Personal Details</h2>
        </div>

        <div className="review-grid">
          <div><strong>Full Name</strong><span>{showValue(personal?.full_name)}</span></div>
          <div><strong>Email</strong><span>{showValue(personal?.email)}</span></div>
          <div><strong>Phone</strong><span>{showValue(personal?.phone)}</span></div>
          <div><strong>Date of Birth</strong><span>{showValue(personal?.date_of_birth)}</span></div>
          <div><strong>Gender</strong><span>{showValue(personal?.gender)}</span></div>
          <div><strong>Current Address</strong><span>{showValue(personal?.current_address)}</span></div>
          <div><strong>Permanent Address</strong><span>{showValue(personal?.permanent_address)}</span></div>
        </div>

        <button className="edit-button" onClick={() => navigate("/your-career")}>
          Edit Personal Details
        </button>
      </section>

      <section className="review-card">
        <div className="review-card-heading">
          <GraduationCap />
          <h2>Education Details</h2>
        </div>

        {education?.length > 0 ? (
          education.map((item, index) => (
            <div className="review-entry" key={item.education_id || index}>
              <h3>{showValue(item.qualification_level)}</h3>
              <div className="review-grid">
              <div>
  <strong>Institution</strong>
  <span>{showValue(item.institution_name)}</span>
</div>

<div>
  <strong>Board / University</strong>
  <span>{showValue(item.board_or_university)}</span>
</div>

<div>
  <strong>Stream / Degree / Branch</strong>
  <span>{showValue(item.degree_or_stream)}</span>
</div>

<div>
  <strong>Roll / Registration Number</strong>
  <span>{showValue(item.roll_number)}</span>
</div>

<div>
  <strong>Passing Year</strong>
  <span>{showValue(item.passing_year)}</span>
</div>

<div>
  <strong>Percentage</strong>
  <span>
    {item.percentage !== null && item.percentage !== undefined
      ? `${item.percentage}%`
      : "Not applicable"}
  </span>
</div>

<div>
  <strong>CGPA</strong>
  <span>
    {item.cgpa !== null && item.cgpa !== undefined
      ? item.cgpa
      : "Not applicable"}
  </span>
</div>
              </div>
            </div>
          ))
        ) : (
          <p className="review-muted">No education details found.</p>
        )}

        <button className="edit-button" onClick={() => navigate("/education-details")}>
          Edit Education
        </button>
      </section>

      <section className="review-card">
        <div className="review-card-heading">
          <Briefcase />
          <h2>Work Experience</h2>
        </div>

        {experience?.length > 0 ? (
          experience.map((item, index) => (
            <div className="review-entry" key={item.experience_id || index}>
              <h3>{showValue(item.job_title)}</h3>
              <div className="review-grid">
                <div><strong>Organisation</strong><span>{showValue(item.organisation_name)}</span></div>
                <div><strong>Employment Type</strong><span>{showValue(item.employment_type)}</span></div>
                <div><strong>Start Date</strong><span>{showValue(item.start_date)}</span></div>
                <div><strong>End Date</strong><span>{item.currently_working ? "Currently Working" : showValue(item.end_date)}</span></div>
              </div>
              <p>{showValue(item.description)}</p>
            </div>
          ))
        ) : (
          <p className="review-muted">No work experience added. This is okay for freshers.</p>
        )}

        <button className="edit-button" onClick={() => navigate("/experience-details")}>
          Edit Experience
        </button>
      </section>

      <section className="review-card">
        <div className="review-card-heading">
          <MapPin />
          <h2>Job Preferences</h2>
        </div>

        <div className="review-grid">
          <div><strong>Preferred Location</strong><span>{showValue(preferences?.preferred_location)}</span></div>
          <div><strong>Preferred Entity</strong><span>{showValue(preferences?.entity_name)}</span></div>
          <div><strong>Department</strong><span>{showValue(preferences?.preferred_department)}</span></div>
          <div><strong>Employment Type</strong><span>{showValue(preferences?.employment_type)}</span></div>
          <div><strong>Hiring Category</strong><span>{showValue(preferences?.hiring_category)}</span></div>
          <div><strong>Notice Period</strong><span>{showValue(preferences?.notice_period)}</span></div>
          <div><strong>Expected Salary</strong><span>{showValue(preferences?.expected_salary)}</span></div>
          <div><strong>Willing to Relocate</strong><span>{preferences?.willing_to_relocate ? "Yes" : "No"}</span></div>
        </div>

        <button className="edit-button" onClick={() => navigate("/preferences")}>
          Edit Preferences
        </button>
      </section>

      <section className="review-card">
        <div className="review-card-heading">
          <FileText />
          <h2>Resume</h2>
        </div>

       {resume?.uploaded ? (
          <div className="resume-status">
            <CheckCircle size={20} />
            <span>Resume uploaded successfully: {showValue(resume.fileName)}</span>
          </div>
        ) : (
          <div className="resume-status missing-resume">
            <AlertCircle size={20} />
            <span>No resume uploaded.</span>
          </div>
        )}

        <button className="edit-button" onClick={() => navigate("/resume")}>
          Edit Resume
        </button>
      </section>

      <div className="review-submit-section">
        <p>
          By submitting, you confirm that the information provided above is
          accurate to the best of your knowledge.
        </p>

        <button
          className="submit-application-button"
          onClick={handleSubmit}
          disabled={submitting || !!success}
        >
          {submitting ? (
            <>
              <LoaderCircle className="spin-icon" size={18} />
              Submitting...
            </>
          ) : success ? (
            <>
              <CheckCircle size={18} />
              Submitted Successfully
            </>
          ) : (
            <>
              <Send size={18} />
              Submit Application
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ReviewApplication;
