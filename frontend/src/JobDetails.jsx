
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  LoaderCircle
} from "lucide-react";

import "./JobDetails.css";

const API_URL = "http://localhost:5000/api/jobs";

function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/${jobId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load job details."
          );
        }

        setJob(result.job);
      } catch (err) {
        console.error("Job details error:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const formatDate = (date) => {
    if (!date) return "Recently posted";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently posted";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

 
const handleApply = () => {
  const candidateToken = sessionStorage.getItem("candidateToken");

  // Save the selected job URL.
  const currentJobPath = `/jobs/${jobId}`;

  if (!candidateToken) {
    // Remember the job if the login page is refreshed.
    sessionStorage.setItem("loginRedirect", currentJobPath);

    // Redirect candidate to login.
    navigate("/login", {
      state: {
        from: currentJobPath
      }
    });

    return;
  }

  // Candidate is already logged in.
  // Continue to the existing candidate application journey.
  navigate("/your-career", {
    state: {
      jobId: job.job_id,
      jobTitle: job.job_title
    }
  });
};


  if (loading) {
    return (
      <main className="job-details-page">
        <div className="job-details-message">
          <LoaderCircle className="job-details-spinner" size={35} />
          <p>Loading job details...</p>
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="job-details-page">
        <div className="job-details-message">
          <h2>Job opportunity not found</h2>
          <p>{error || "This job may have been closed or removed."}</p>
          <button
            className="job-back-button"
            onClick={() => navigate("/jobs")}
          >
            <ArrowLeft size={17} />
            Back to jobs
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="job-details-page">

      <button
        className="job-back-link"
        onClick={() => navigate("/jobs")}
      >
        <ArrowLeft size={17} />
        Back to all jobs
      </button>

      <section className="job-details-hero">
        <span className="job-details-eyebrow">
          CAREERS AT DRISHTEE
        </span>

        <div className="job-details-title-row">
          <div>
            <h1>{job.job_title}</h1>

            <p className="job-details-organisation">
              <Building2 size={17} />
              {job.entity_name || "Drishtee"}
              {job.entity_code && ` (${job.entity_code})`}
            </p>
          </div>

          <span className="job-details-status">
            <CheckCircle2 size={15} />
            Open position
          </span>
        </div>

        <div className="job-details-meta">
          <div>
            <MapPin size={18} />
            {job.location || "Location not specified"}
          </div>

          <div>
            <BriefcaseBusiness size={18} />
            {job.employment_type || "Employment type not specified"}
          </div>

          {job.department && (
            <div>
              <Building2 size={18} />
              {job.department}
            </div>
          )}

          <div>
            <CalendarDays size={18} />
            Posted {formatDate(job.posted_at)}
          </div>
        </div>

        <button
          className="job-apply-button"
          onClick={handleApply}
        >
          Apply Now
          <ArrowRight size={18} />
        </button>
      </section>

      <section className="job-details-content">

        <div className="job-details-main">

          <article className="job-details-section">
            <h2>About the role</h2>
            <p>
              {job.description ||
                "No job description has been provided yet."}
            </p>
          </article>

          <article className="job-details-section">
            <h2>Requirements and qualifications</h2>
            <p>
              {job.requirements ||
                "Please contact the Drishtee recruitment team for further information about the role requirements."}
            </p>
          </article>

        </div>

        <aside className="job-details-sidebar">
          <h3>Job overview</h3>

          <div className="job-overview-item">
            <span>Job title</span>
            <strong>{job.job_title}</strong>
          </div>

          <div className="job-overview-item">
            <span>Organisation</span>
            <strong>{job.entity_name || "Drishtee"}</strong>
          </div>

          <div className="job-overview-item">
            <span>Location</span>
            <strong>{job.location || "Not specified"}</strong>
          </div>

          <div className="job-overview-item">
            <span>Employment type</span>
            <strong>{job.employment_type || "Not specified"}</strong>
          </div>

          <button
            className="job-apply-button job-sidebar-apply"
            onClick={handleApply}
          >
            Apply Now
            <ArrowRight size={17} />
          </button>
        </aside>

      </section>
    </main>
  );
}

export default JobDetails;
