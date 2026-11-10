
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import HomePage from "./HomePage";
import Footer from "./Footer";

import Register from "./Register";
import Login from "./Login";

import CandidateProfile from "./CandidateProfile";
import EducationDetails from "./EducationDetails";
import ExperienceDetails from "./ExperienceDetails";
import Preferences from "./Preferences";
import ResumeUpload from "./ResumeUpload";
import ReviewApplication from "./ReviewApplication";

import HRLogin from "./HRLogin";
import HRDashboard from "./HRDashboard";
import HRCandidates from "./HRCandidates";
import JobDetails from "./JobDetails";

import Jobs from "./Jobs";

import "./App.css";

// Temporary pages
function PlaceholderPage({ title }) {
  return (
    <div className="placeholder-page">
      <h1>{title}</h1>
      <p>This page will be developed soon.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">

        {/* Top Navigation */}
        <Navbar />

        <div className="main-layout">

          {/* Sidebar Navigation */}
          <Sidebar />

          {/* Main Page Content */}
          <main className="page-content">

            <Routes>

              {/* =========================
                  HOME PAGE
              ========================== */}
              <Route
                path="/"
                element={<HomePage />}
              />

              {/* =========================
                  CAREER / JOB PAGES
              ========================== */}

              {/* Explore Jobs */}
              <Route
                path="/jobs"
                element={<Jobs />}
              />

              {/* Individual Job Details */}
              <Route
                path="/jobs/:jobId"
                element={<JobDetails />}
              />

              {/* Student Opportunities */}
              <Route
                path="/students"
                element={
                  <PlaceholderPage title="Student Opportunities" />
                }
              />

              {/* How We Work */}
              <Route
                path="/how-we-work"
                element={
                  <PlaceholderPage title="How We Work" />
                }
              />

              {/* How We Hire */}
              <Route
                path="/how-we-hire"
                element={
                  <PlaceholderPage title="How We Hire" />
                }
              />

              {/* =========================
                  CANDIDATE AUTHENTICATION
              ========================== */}

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/register"
                element={<Register />}
              />

              {/* =========================
                  CANDIDATE PROFILE
              ========================== */}

              {/* Step 1: Personal Details */}
              <Route
                path="/your-career"
                element={<CandidateProfile />}
              />

              {/* Step 2: Education Details */}
              <Route
                path="/education-details"
                element={<EducationDetails />}
              />

              {/* Step 3: Experience Details */}
              <Route
                path="/experience-details"
                element={<ExperienceDetails />}
              />

              {/* Step 4: Job Preferences */}
              <Route
                path="/preferences"
                element={<Preferences />}
              />

              {/* Step 5: Resume Upload */}
              <Route
                path="/resume"
                element={<ResumeUpload />}
              />

              {/* Step 6: Review Application */}
              <Route
                path="/review"
                element={<ReviewApplication />}
              />

              {/* =========================
                  HR AUTHENTICATION
              ========================== */}

              <Route
                path="/hr/login"
                element={<HRLogin />}
              />

              {/* =========================
                  HR DASHBOARD
              ========================== */}

              <Route
                path="/hr/dashboard"
                element={<HRDashboard />}
              />

              {/* HR Candidate Management */}
              <Route
                path="/hr/candidates"
                element={<HRCandidates />}
              />

              {/* =========================
                  FALLBACK PAGE
              ========================== */}

              <Route
                path="*"
                element={<PlaceholderPage title="Page Not Found" />}
              />
                  
            </Routes>

            {/* Footer */}
            <Footer />

          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
