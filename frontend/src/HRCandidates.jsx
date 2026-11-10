import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Eye,
  RefreshCw,
  ArrowLeft,
  Download,
  FileText,
} from "lucide-react";
import "./HRCandidates.css";

const API_BASE_URL = "https://carrer-portal-dpo8.onrender.com";

function HRCandidates() {
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [resumeLoadingId, setResumeLoadingId] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    location: "",
    qualification: "",
    stream: "",
  });

  // Fetch candidates from the protected HR API.
  const fetchCandidates = useCallback(
    async (filterValues = {}) => {
      try {
        setLoading(true);
        setError("");

        const token = sessionStorage.getItem("hrToken");

        if (!token) {
          navigate("/hr/login", { replace: true });
          return;
        }

        const query = new URLSearchParams();

        Object.entries(filterValues).forEach(([key, value]) => {
          if (typeof value === "string" && value.trim()) {
            query.append(key, value.trim());
          }
        });

        const queryString = query.toString();
        const url = `${API_BASE_URL}/api/hr/candidates${
          queryString ? `?${queryString}` : ""
        }`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem("hrToken");
          sessionStorage.removeItem("hrUser");
          navigate("/hr/login", { replace: true });
          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load candidates.");
        }

        setCandidates(result.candidates || []);
      } catch (err) {
        console.error("Candidate Fetch Error:", err);
        setError(err.message || "Something went wrong while loading candidates.");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    fetchCandidates({});
  }, [fetchCandidates]);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    fetchCandidates(filters);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: "",
      location: "",
      qualification: "",
      stream: "",
    };

    setFilters(emptyFilters);
    fetchCandidates({});
  };

  const showValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Not provided";
    }
    return value;
  };

  // View or download a candidate's PDF resume.
  const handleResumeAction = async (candidateId, action) => {
    const token = sessionStorage.getItem("hrToken");

    if (!token) {
      navigate("/hr/login", { replace: true });
      return;
    }

    // Open the tab synchronously after the button click so the browser
    // does not block it as an unexpected popup.
    const newTab = action === "view" ? window.open("about:blank", "_blank") : null;

    if (action === "view" && !newTab) {
      setError("Please allow pop-ups for this website to view the resume.");
      return;
    }

    try {
      setResumeLoadingId(candidateId);
      setError("");

      const url = `${API_BASE_URL}/api/hr/candidates/${candidateId}/resume${
        action === "view" ? "?action=view" : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("hrToken");
        sessionStorage.removeItem("hrUser");

        if (newTab) {
          newTab.close();
        }

        navigate("/hr/login", { replace: true });
        return;
      }

      if (!response.ok) {
        let message = "Unable to access the candidate's resume.";

        try {
          const result = await response.json();
          message = result.message || message;
        } catch {
          // The server may return a non-JSON error response.
        }

        throw new Error(message);
      }

      const responseBlob = await response.blob();

      // Check that the downloaded content is actually a PDF.
      const firstBytes = new Uint8Array(await responseBlob.slice(0, 5).arrayBuffer());
      const pdfSignature = String.fromCharCode(...firstBytes);

      if (pdfSignature !== "%PDF-") {
        throw new Error(
          "The file returned by the server is not a valid PDF. Please check the uploaded resume."
        );
      }

      // Explicitly set the MIME type so the browser opens the blob as a PDF
      // instead of treating it as a generic binary download.
      const pdfBlob = new Blob([responseBlob], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      if (action === "view") {
        newTab.location.replace(pdfUrl);
      } else {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `Drishtee_Candidate_${candidateId}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Keep the URL alive long enough for the browser's PDF viewer/download.
      window.setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 5 * 60 * 1000);
    } catch (err) {
      console.error("Resume Action Error:", err);

      if (newTab && !newTab.closed) {
        newTab.close();
      }

      setError(err.message || "Unable to access candidate resume.");
    } finally {
      setResumeLoadingId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not provided";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="hr-candidates-page">
      {/* Page Header */}
      <div className="hr-candidates-header">
        <div>
          <span className="hr-candidates-label">DRISHTEE CAREERS</span>
          <h1>Manage Candidates</h1>
          <p>View and manage registered candidate profiles.</p>
        </div>

        <button
          type="button"
          className="hr-back-button"
          onClick={() => navigate("/hr/dashboard")}
        >
          <ArrowLeft size={17} />
          Dashboard
        </button>
      </div>

      {/* Candidate Summary */}
      <div className="hr-candidate-summary">
        <Users size={25} />
        <div>
          <h2>{candidates.length}</h2>
          <p>Matching Candidates</p>
        </div>
      </div>

      {/* Search and Filters */}
      <form className="hr-candidate-filters" onSubmit={handleFilterSubmit}>
        <div className="hr-filter-field hr-search-field">
          <label htmlFor="candidate-search">Search Candidate</label>
          <div className="hr-search-input">
            <Search size={18} />
            <input
              id="candidate-search"
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Name, email or phone"
            />
          </div>
        </div>

        <div className="hr-filter-field">
          <label htmlFor="candidate-location">Preferred Location</label>
          <input
            id="candidate-location"
            type="text"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            placeholder="Enter location"
          />
        </div>

        <div className="hr-filter-field">
          <label htmlFor="candidate-qualification">Qualification</label>
          <select
            id="candidate-qualification"
            name="qualification"
            value={filters.qualification}
            onChange={handleFilterChange}
          >
            <option value="">All Qualifications</option>
            <option value="Class 10">Class 10</option>
            <option value="Class 12">Class 12</option>
            <option value="Diploma">Diploma</option>
            <option value="Graduation">Graduation</option>
            <option value="Post Graduation">Post Graduation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="hr-filter-field">
          <label htmlFor="candidate-stream">Degree / Stream</label>
          <input
            id="candidate-stream"
            type="text"
            name="stream"
            value={filters.stream}
            onChange={handleFilterChange}
            placeholder="e.g. Information Technology"
          />
        </div>

        <div className="hr-filter-actions">
          <button type="submit" className="hr-filter-button" disabled={loading}>
            <Search size={16} />
            Search
          </button>

          <button
            type="button"
            className="hr-clear-button"
            onClick={clearFilters}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Clear
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="hr-candidate-error" role="alert">
          {error}
        </div>
      )}

      {/* Candidate Table */}
      <div className="hr-candidate-table-container">
        <div className="hr-table-heading">
          <h2>Candidate Records</h2>
          <span>{candidates.length} candidates</span>
        </div>

        {loading ? (
          <p className="hr-candidate-message">Loading candidates...</p>
        ) : candidates.length === 0 ? (
          <p className="hr-candidate-message">No candidates found.</p>
        ) : (
          <div className="hr-table-scroll">
            <table className="hr-candidates-table">
              <thead>
                <tr>
                  <th>Candidate ID</th>
                  <th>Candidate Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Qualification</th>
                  <th>Preferred Location</th>
                  <th>Profile Status</th>
                  <th>Resume</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.candidate_id}>
                    <td>#{candidate.candidate_id}</td>
                    <td>{showValue(candidate.full_name)}</td>
                    <td>{showValue(candidate.email)}</td>
                    <td>{showValue(candidate.phone)}</td>
                    <td>
                      {candidate.education?.length
                        ? candidate.education
                            .map((item) => item.qualification_level)
                            .filter(Boolean)
                            .join(", ")
                        : "Not provided"}
                    </td>
                    <td>{showValue(candidate.preferred_location)}</td>
                    <td>
                      <span
                        className={`hr-status ${
                          candidate.profile_status === "Completed"
                            ? "completed"
                            : "in-progress"
                        }`}
                      >
                        {showValue(candidate.profile_status)}
                      </span>
                    </td>
                    <td>
                      {candidate.hasResume ? "Uploaded" : "Not uploaded"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="hr-view-button"
                        onClick={() => setSelectedCandidate(candidate)}
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div
          className="hr-candidate-modal-overlay"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="hr-candidate-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="hr-modal-header">
              <div>
                <span>Candidate Profile</span>
                <h2>{selectedCandidate.full_name}</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="hr-modal-close"
                aria-label="Close candidate profile"
              >
                ×
              </button>
            </div>

            {/* Personal Details */}
            <div className="hr-modal-section">
              <h3>Personal Details</h3>
              <p>Email: {showValue(selectedCandidate.email)}</p>
              <p>Phone: {showValue(selectedCandidate.phone)}</p>
              <p>
                Date of Birth: {formatDate(selectedCandidate.date_of_birth)}
              </p>
              <p>Gender: {showValue(selectedCandidate.gender)}</p>
              <p>
                Experience Type: {showValue(selectedCandidate.experience_type)}
              </p>
              <p>
                Current Address: {showValue(selectedCandidate.current_address)}
              </p>
              <p>Current City: {showValue(selectedCandidate.current_city)}</p>
              <p>Current State: {showValue(selectedCandidate.current_state)}</p>
              <p>
                Current Pincode: {showValue(selectedCandidate.current_pincode)}
              </p>
              <p>
                Permanent Address:{" "}
                {showValue(selectedCandidate.permanent_address)}
              </p>
              <p>
                Permanent City: {showValue(selectedCandidate.permanent_city)}
              </p>
              <p>
                Permanent State: {showValue(selectedCandidate.permanent_state)}
              </p>
              <p>
                Permanent Pincode:{" "}
                {showValue(selectedCandidate.permanent_pincode)}
              </p>
            </div>

            {/* Education Details */}
            <div className="hr-modal-section">
              <h3>Education Details</h3>

              {selectedCandidate.education?.length ? (
                selectedCandidate.education.map((item) => (
                  <div key={item.education_id} className="hr-detail-item">
                    <strong>{showValue(item.qualification_level)}</strong>
                    <p>Institution: {showValue(item.institution_name)}</p>
                    <p>
                      Board / University:{" "}
                      {showValue(item.board_or_university)}
                    </p>
                    <p>Degree / Stream: {showValue(item.degree_or_stream)}</p>
                    <p>Roll Number: {showValue(item.roll_number)}</p>
                    <p>Passing Year: {showValue(item.passing_year)}</p>
                    <p>Percentage: {showValue(item.percentage)}</p>
                    <p>CGPA: {showValue(item.cgpa)}</p>
                  </div>
                ))
              ) : (
                <p>No education records available.</p>
              )}
            </div>

            {/* Work Experience */}
            <div className="hr-modal-section">
              <h3>Work Experience</h3>

              {selectedCandidate.experience?.length ? (
                selectedCandidate.experience.map((item) => (
                  <div key={item.experience_id} className="hr-detail-item">
                    <strong>{showValue(item.job_title)}</strong>
                    <p>Organisation: {showValue(item.organisation_name)}</p>
                    <p>Employment Type: {showValue(item.employment_type)}</p>
                    <p>Start Date: {formatDate(item.start_date)}</p>
                    <p>
                      End Date:{" "}
                      {item.currently_working
                        ? "Currently working"
                        : formatDate(item.end_date)}
                    </p>
                    <p>Description: {showValue(item.description)}</p>
                  </div>
                ))
              ) : (
                <p>No work experience records available.</p>
              )}
            </div>

            {/* Job Preferences */}
            <div className="hr-modal-section">
              <h3>Job Preferences</h3>
              <p>
                Preferred Location:{" "}
                {showValue(selectedCandidate.preferred_location)}
              </p>
              <p>
                Preferred Entity: {showValue(selectedCandidate.entity_name)}
              </p>
              <p>
                Hiring Category: {showValue(selectedCandidate.hiring_category)}
              </p>
              <p>
                Department: {showValue(selectedCandidate.preferred_department)}
              </p>
              <p>
                Employment Type: {showValue(selectedCandidate.employment_type)}
              </p>
              <p>Notice Period: {showValue(selectedCandidate.notice_period)}</p>
              <p>
                Expected Salary:{" "}
                {selectedCandidate.expected_salary === null ||
                selectedCandidate.expected_salary === undefined
                  ? "Not provided"
                  : `₹${selectedCandidate.expected_salary}`}
              </p>
              <p>
                Willing to Relocate:{" "}
                {selectedCandidate.willing_to_relocate ? "Yes" : "No"}
              </p>
            </div>

            {/* Resume Section */}
            <div className="hr-modal-section">
              <h3>Resume</h3>

              {selectedCandidate.hasResume ? (
                <>
                  <div className="hr-resume-info">
                    <FileText size={22} />
                    <div>
                      <strong>Resume uploaded</strong>
                      <p>PDF document available</p>
                    </div>
                  </div>

                  <div className="hr-resume-actions">
                    <button
                      type="button"
                      className="hr-resume-view-button"
                      disabled={
                        resumeLoadingId === selectedCandidate.candidate_id
                      }
                      onClick={() =>
                        handleResumeAction(
                          selectedCandidate.candidate_id,
                          "view"
                        )
                      }
                    >
                      <Eye size={16} />
                      {resumeLoadingId === selectedCandidate.candidate_id
                        ? "Please wait..."
                        : "View Resume"}
                    </button>

                    <button
                      type="button"
                      className="hr-resume-download-button"
                      disabled={
                        resumeLoadingId === selectedCandidate.candidate_id
                      }
                      onClick={() =>
                        handleResumeAction(
                          selectedCandidate.candidate_id,
                          "download"
                        )
                      }
                    >
                      <Download size={16} />
                      {resumeLoadingId === selectedCandidate.candidate_id
                        ? "Please wait..."
                        : "Download Resume"}
                    </button>
                  </div>
                </>
              ) : (
                <p className="hr-resume-missing">
                  No resume uploaded by this candidate.
                </p>
              )}
            </div>

            {/* Profile Status */}
            <div className="hr-modal-section">
              <h3>Profile Status</h3>
              <span
                className={`hr-status ${
                  selectedCandidate.profile_status === "Completed"
                    ? "completed"
                    : "in-progress"
                }`}
              >
                {showValue(selectedCandidate.profile_status)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HRCandidates;
