
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  BriefcaseBusiness,
  ArrowRight,
  CalendarDays,
  Building2
} from "lucide-react";

function FeaturedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/jobs");

        if (!response.ok) {
          throw new Error("Unable to load job openings.");
        }

        const data = await response.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <section className="featured-jobs-section">
      <div className="featured-heading">
        <div>
          <span className="section-label">JOIN OUR TEAM</span>
          <h2>Latest opportunities.</h2>
          <p>Find a role where your skills can create a meaningful impact.</p>
        </div>

        <Link to="/jobs" className="view-all-link">
          View all jobs <ArrowRight size={17} />
        </Link>
      </div>

      {loading && (
        <div className="jobs-message">
          <div className="loading-spinner"></div>
          <p>Finding opportunities for you...</p>
        </div>
      )}

      {!loading && error && (
        <div className="jobs-message">
          <BriefcaseBusiness size={30} />
          <h3>Unable to load vacancies</h3>
          <p>{error}</p>
          <p>Check that the backend is running and the jobs API is available.</p>
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="jobs-message">
          <BriefcaseBusiness size={32} />
          <h3>No open positions right now</h3>
          <p>
            We don't have any published vacancies at the moment.
            Please check again soon.
          </p>
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="latest-jobs-grid">
          {jobs.map((job) => (
            <article className="latest-job-card" key={job.job_id}>
              <div className="latest-job-top">
                <div className="latest-job-icon">
                  <Building2 size={22} />
                </div>
                <span className="job-status">
                  {job.status || "Open"}
                </span>
              </div>

              <h3>{job.job_title}</h3>

              <p className="job-department">
                {job.department || "Drishtee"}
              </p>

              <div className="latest-job-details">
                <span>
                  <MapPin size={15} />
                  {job.location || "Location not specified"}
                </span>

                <span>
                  <BriefcaseBusiness size={15} />
                  {job.employment_type || "Not specified"}
                </span>
              </div>

              <p className="latest-job-description">
                {job.description || "Explore this opportunity at Drishtee."}
              </p>

              <div className="latest-job-footer">
                <span>
                  <CalendarDays size={15} />
                  {job.posted_at
                    ? new Date(job.posted_at).toLocaleDateString("en-IN")
                    : "Recently posted"}
                </span>

                <Link
                  to={`/jobs?jobId=${job.job_id}`}
                  className="job-details-link"
                >
                  View details <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default FeaturedJobs;
