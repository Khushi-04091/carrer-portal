
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  BriefcaseBusiness,
  Building2,
  ArrowRight,
  RefreshCw,
  CalendarDays,
  ChevronDown,
  SlidersHorizontal
} from "lucide-react";

import "./Jobs.css";

const API_URL = "http://localhost:5000/api/jobs";

function Jobs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [entity, setEntity] = useState("");

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) params.append("search", search.trim());
      if (location) params.append("location", location);
      if (employmentType) {
        params.append("employment_type", employmentType);
      }
      if (entity) params.append("entity_id", entity);

      const response = await fetch(`${API_URL}?${params.toString()}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load jobs.");
      }

      // Your backend returns { success, total, jobs }
      setJobs(Array.isArray(result.jobs) ? result.jobs : []);
    } catch (err) {
      console.error("Fetch jobs error:", err);
      setError(err.message || "Something went wrong.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [search, location, employmentType, entity]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchJobs]);

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setEmploymentType("");
    setEntity("");
  };

  const formatDate = (date) => {
    if (!date) return "Recently posted";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Recently posted";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // Build filter options from the jobs currently returned by the API.
  const locations = [
    ...new Set(jobs.map((job) => job.location).filter(Boolean))
  ].sort();

  const employmentTypes = [
    ...new Set(
      jobs.map((job) => job.employment_type).filter(Boolean)
    )
  ].sort();

  const entities = [
    ...new Map(
      jobs
        .filter((job) => job.entity_id)
        .map((job) => [
          String(job.entity_id),
          job.entity_name || job.entity_code || "Organisation"
        ])
    )
  ];

  return (
    <main className="jobs-page">

      <section className="jobs-page-header">
        <span className="jobs-eyebrow">CAREERS AT DRISHTEE</span>

        <h1>
          Find work that <span>creates impact.</span>
        </h1>

        <p>
          Discover meaningful opportunities and become part of
          a team working towards stronger rural communities.
        </p>
      </section>

      <section className="jobs-main-search">
        <Search size={21} />

        <input
          type="text"
          placeholder="Search by job title, skills or keywords"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </section>

      <section className="jobs-layout">

        {/* LEFT FILTER SIDEBAR */}
        <aside className="jobs-sidebar">
          <div className="jobs-filter-heading">
            <div>
              <SlidersHorizontal size={19} />
              <h2>Filter jobs</h2>
            </div>

            <button type="button" onClick={clearFilters}>
              Clear all
            </button>
          </div>

          <details className="jobs-filter-group" open>
            <summary>
              Location
              <ChevronDown size={17} />
            </summary>

            <div className="jobs-filter-content">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">All locations</option>
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </details>

          <details className="jobs-filter-group">
            <summary>
              Experience
              <ChevronDown size={17} />
            </summary>

            <div className="jobs-filter-content">
              <p>
                Experience filters will be available once experience
                requirements are stored in the jobs database.
              </p>
            </div>
          </details>

          <details className="jobs-filter-group">
            <summary>
              Skills and qualifications
              <ChevronDown size={17} />
            </summary>

            <div className="jobs-filter-content">
              <p>
                Skills filters can be added when job skills are
                stored as structured data.
              </p>
            </div>
          </details>

          <details className="jobs-filter-group">
            <summary>
              Degree
              <ChevronDown size={17} />
            </summary>

            <div className="jobs-filter-content">
              <p>
                Degree filters can be added when qualification
                requirements are stored separately.
              </p>
            </div>
          </details>

          <details className="jobs-filter-group" open>
            <summary>
              Job type
              <ChevronDown size={17} />
            </summary>

            <div className="jobs-filter-content">
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
              >
                <option value="">All job types</option>
                {employmentTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </details>

          <details className="jobs-filter-group" open>
            <summary>
              Organisation
              <ChevronDown size={17} />
            </summary>

            <div className="jobs-filter-content">
              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
              >
                <option value="">All organisations</option>
                {entities.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </details>
        </aside>

        {/* RIGHT SIDE JOB LISTINGS */}
        <section className="jobs-results">

          <div className="jobs-results-header">
            <div>
              <span className="jobs-section-label">
                EXPLORE OPPORTUNITIES
              </span>

              <h2>Available opportunities</h2>

              <p>
                {loading
                  ? "Loading opportunities..."
                  : `${jobs.length} opportunities found`}
              </p>
            </div>

            <button
              type="button"
              className="jobs-refresh-button"
              onClick={fetchJobs}
              disabled={loading}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>

          {loading && (
            <div className="jobs-message">
              <div className="jobs-loader" />
              <p>Finding opportunities for you...</p>
            </div>
          )}

          {!loading && error && (
            <div className="jobs-message jobs-error">
              <h3>Unable to load jobs</h3>
              <p>{error}</p>
              <button type="button" onClick={fetchJobs}>
                Try again
              </button>
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="jobs-message jobs-empty">
              <BriefcaseBusiness size={40} />
              <h3>No matching opportunities found</h3>
              <p>
                There are currently no published jobs matching
                your filters. Please check again later.
              </p>
              <button type="button" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <div className="jobs-list">
              {jobs.map((job) => (
                <article className="job-card" key={job.job_id}>

                  <div className="job-card-top">
                    <div className="job-entity-icon">
                      <Building2 size={23} />
                    </div>

                    <span className="job-open-badge">
                      Open position
                    </span>
                  </div>

                  <div className="job-card-content">
                    <span className="job-entity-name">
                      {job.entity_name || "Drishtee"}
                      {job.entity_code && ` · ${job.entity_code}`}
                    </span>

                    <h3>{job.job_title}</h3>

                    {job.department && (
                      <p className="job-department">
                        {job.department}
                      </p>
                    )}

                    <div className="job-meta-list">
                      <div>
                        <MapPin size={16} />
                        <span>
                          {job.location || "Location not specified"}
                        </span>
                      </div>

                      <div>
                        <BriefcaseBusiness size={16} />
                        <span>
                          {job.employment_type || "Type not specified"}
                        </span>
                      </div>

                      <div>
                        <CalendarDays size={16} />
                        <span>
                          Posted {formatDate(job.posted_at)}
                        </span>
                      </div>
                    </div>

                    <div className="job-description-block">
                      <h4>About the role</h4>
                      <p>
                        {job.description ||
                          "Explore this opportunity and learn more about the role at Drishtee."}
                      </p>
                    </div>
                  </div>

                  <div className="job-card-footer">
                    <button
                      type="button"
                      onClick={() => navigate(`/jobs/${job.job_id}`)}
                    >
                      Learn more
                      <ArrowRight size={17} />
                    </button>
                  </div>

                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Jobs;
