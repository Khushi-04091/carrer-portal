
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  FileUp,
  Download,
  Trash2,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  File
} from "lucide-react";

import "./ResumeUpload.css";

const API_URL = "http://localhost:5000/api/profile";

function ResumeUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [resume, setResume] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const getToken = () => sessionStorage.getItem("candidateToken");

  // Load previously uploaded resume
  const fetchResume = async () => {
    try {
      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`${API_URL}/resume`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load resume.");
      }

      setResume(data.data?.hasResume ? data.data : null);
    } catch (error) {
      console.error("Resume Loading Error:", error);
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
  }, []);

  // Validate selected file
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setMessage("");
    setMessageType("");
    setSelectedFile(null);

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") ||
        file.type !== "application/pdf") {
      setMessage("Please select a valid PDF file.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Resume size must not exceed 5 MB.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    if (file.size === 0) {
      setMessage("The selected file is empty.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // Upload or replace resume
  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    try {
      setUploading(true);
      setMessage("");

      const token = getToken();

      if (!token) {
        navigate("/login");
        return;
      }

      const formData = new FormData();
      formData.append("resume", selectedFile);

      const response = await fetch(`${API_URL}/resume`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Resume upload failed.");
      }

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchResume();

      setMessage(data.message || "Resume uploaded successfully!");
      setMessageType("success");

    } catch (error) {
      console.error("Resume Upload Error:", error);
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  // Download resume securely
  const handleDownload = async () => {
    try {
      setDownloading(true);
      setMessage("");

      const token = getToken();

      const response = await fetch(`${API_URL}/resume/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Unable to download resume.");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "Drishtee_Resume.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error("Resume Download Error:", error);
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setDownloading(false);
    }
  };

  // Delete existing resume
  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your uploaded resume?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setMessage("");

      const response = await fetch(`${API_URL}/resume`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete resume.");
      }

      setResume(null);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage(data.message);
      setMessageType("success");

    } catch (error) {
      console.error("Resume Delete Error:", error);
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="resume-loading">
        Loading your resume details...
      </div>
    );
  }

  return (
    <div className="resume-page">

      <div className="resume-header">
        <span className="resume-eyebrow">DRISHTEE CAREERS</span>
        <h1>Complete Your Candidate Profile</h1>
        <p>
          Upload your latest resume so our recruitment team can
          understand your qualifications and experience.
        </p>
      </div>

      {/* Application progress */}
      <div className="resume-progress">
        {[
          "Personal",
          "Education",
          "Experience",
          "Preferences",
          "Resume",
          "Review"
        ].map((step, index) => (
          <div className="resume-progress-item" key={step}>
            <div
              className={`resume-progress-step ${
                index <= 4 ? "completed" : ""
              } ${index === 4 ? "active" : ""}`}
            >
              <span>{index <= 3 ? "✓" : index + 1}</span>
              <p>{step}</p>
            </div>

            {index !== 5 && (
              <div className="resume-progress-line" />
            )}
          </div>
        ))}
      </div>

      <div className="resume-form-card">

        <div className="resume-section-heading">
          <div className="resume-icon">
            <FileText size={25} />
          </div>

          <div>
            <h2>Resume Upload</h2>
            <p>
              Upload your latest professional resume.
            </p>
          </div>
        </div>

        <div className="resume-instructions">
          <h3>Before uploading your resume</h3>
          <ul>
            <li>Upload your resume in PDF format only.</li>
            <li>Maximum allowed file size is 5 MB.</li>
            <li>Make sure your contact details are correct.</li>
            <li>Upload your latest and updated resume.</li>
          </ul>
        </div>

        {resume ? (
          <div className="resume-existing">
            <div className="resume-file-icon">
              <FileText size={30} />
            </div>

            <div className="resume-file-details">
              <strong>Resume uploaded</strong>
              <span>{resume.fileName}</span>
              <small>
                Your resume is saved to your candidate account.
              </small>
            </div>

            <CheckCircle2
              className="resume-check-icon"
              size={25}
            />
          </div>
        ) : (
          <div className="resume-empty">
            <FileUp size={42} />
            <h3>No resume uploaded yet</h3>
            <p>Select your resume PDF file below.</p>
          </div>
        )}

        <div className="resume-upload-area">
          <label htmlFor="resume-file">
            <FileUp size={30} />
            <strong>
              {resume ? "Choose a new resume" : "Choose your resume"}
            </strong>
            <span>Click to browse PDF files (Maximum 5 MB)</span>
          </label>

          <input
            ref={fileInputRef}
            id="resume-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
          />
        </div>

        {selectedFile && (
          <div className="resume-selected-file">
            <File size={22} />

            <div>
              <strong>{selectedFile.name}</strong>
              <span>
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              aria-label="Remove selected file"
            >
              <Trash2 size={19} />
            </button>
          </div>
        )}

        {selectedFile && (
          <button
            type="button"
            className="resume-upload-button"
            onClick={handleUpload}
            disabled={uploading}
          >
            <FileUp size={18} />
            {uploading
              ? "Uploading..."
              : resume
                ? "Replace Existing Resume"
                : "Upload Resume"}
          </button>
        )}

        {resume && (
          <div className="resume-file-actions">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download size={17} />
              {downloading ? "Downloading..." : "Download Resume"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 size={17} />
              {deleting ? "Deleting..." : "Delete Resume"}
            </button>
          </div>
        )}

        {message && (
          <div
            className={`resume-message ${messageType}`}
            role="alert"
          >
            {message}
          </div>
        )}

        <div className="resume-actions">
          <button
            type="button"
            className="resume-back-button"
            onClick={() => navigate("/preferences")}
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <button
            type="button"
            className="resume-next-button"
            onClick={() => {
              if (!resume) {
                setMessage("Please upload your resume before continuing.");
                setMessageType("error");
                return;
              }

              navigate("/review");
            }}
          >
            Save & Continue
            <ArrowRight size={17} />
          </button>
        </div>

      </div>
    </div>
  );
}

export default ResumeUpload;
