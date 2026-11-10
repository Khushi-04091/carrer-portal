
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  Heart
} from "lucide-react";

import "./Footer.css";

function Footer() {
  return (
    <footer className="drishtee-footer">

      {/* Main Footer */}
      <div className="footer-main">

        {/* Contact Information */}
        <div className="footer-contact">

          <Link to="/" className="footer-logo">
            <span>DRISHTEE</span>
            <small>CAREERS</small>
          </Link>

          <p className="footer-description">
            Creating opportunities. Empowering communities.
            Building a better future through meaningful work.
          </p>

          <div className="footer-contact-item">
            <Phone size={18} />
            <a href="tel:+911145873446">
              +91 11 4587 3446
            </a>
          </div>

          <div className="footer-contact-item">
            <Mail size={18} />
            <a href="mailto:info@drishtee.in">
              info@drishtee.in
            </a>
          </div>

          <div className="footer-contact-item footer-address">
            <MapPin size={20} />
            <p>
              Innov8 CP2 Center, 2nd Floor,
              Property No. 44, Above Madame
              Tussauds, Regal Building,
              Connaught Place, New Delhi-
              110001, India
            </p>
          </div>

        </div>

        {/* Our Websites */}
        <div className="footer-column">
          <h3>OUR WEBSITES</h3>

          <ul>
            <li>Drishtee Foundation - India</li>
            <li>Drishtee Foundation - USA</li>
            <li>Drishtee Foundation - Japan</li>
            <li>Swavlamban</li>
            <li>Ekyam</li>
            <li>Blogs</li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3>QUICK LINKS</h3>

          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/how-we-work">How We Work</Link></li>
            <li><Link to="/how-we-hire">How We Hire</Link></li>
            <li><Link to="/students">Students</Link></li>
            <li><Link to="/jobs">Jobs</Link></li>
            <li><Link to="/your-career">Your Career</Link></li>
          </ul>
        </div>

        {/* Get Started */}
        <div className="footer-column">
          <h3>GET STARTED</h3>

          <ul>
            <li><Link to="/jobs">Work with us</Link></li>
            <li><Link to="/students">Student Opportunities</Link></li>
            <li><Link to="/register">Register with us</Link></li>
            <li><Link to="/login">Candidate Login</Link></li>
            <li><Link to="/jobs">Explore Opportunities</Link></li>
          </ul>

          <Link to="/jobs" className="footer-explore-link">
            Explore Careers
            <ArrowUpRight size={16} />
          </Link>
        </div>

      </div>

      {/* Purpose Banner */}
      <div className="footer-purpose">
        <div className="footer-purpose-content">
          <span>OUR PURPOSE</span>
          <h2>Empowering Rural India</h2>
          <p>
            Creating opportunities. Building stronger communities.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Drishtee Careers.
          All rights reserved.
        </p>

        <p className="footer-made-with">
          Made with <Heart size={14} fill="currentColor" />
          for meaningful change.
        </p>
      </div>

    </footer>
  );
}

export default Footer;
