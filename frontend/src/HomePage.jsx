
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Users,
  Sprout,
  BriefcaseBusiness,
  HeartHandshake,
  MoveUpRight,
  Pause,
  Play
} from "lucide-react";

import JobSearch from "./JobSearch";
import FeaturedJobs from "./FeaturedJobs";
import "./HomePage.css";

const opportunities = [
  {
    id: 1,
    title: "Gram Vidushi & Vidushi Fellows",
    category: "Vidushi",
    description:
      "Support rural women, strengthen local communities and create sustainable livelihood opportunities.",
    icon: Sprout,
    number: "01",
    tags: ["Community Development", "Rural Livelihoods"],
    color: "peach"
  },
  {
    id: 2,
    title: "Maan Vidushi",
    category: "Maan Vidushi",
    description:
      "Contribute to initiatives that empower women and help build stronger rural communities.",
    icon: HeartHandshake,
    number: "02",
    tags: ["Women Empowerment", "Field Opportunities"],
    color: "cream"
  },
  {
    id: 3,
    title: "Lateral Hiring",
    category: "Lateral",
    description:
      "Bring your professional skills, experience and ideas to make a meaningful difference at Drishtee.",
    icon: BriefcaseBusiness,
    number: "03",
    tags: ["Experienced Professionals", "Multiple Functions"],
    color: "sand"
  }
];

// Five original Drishtee images
const heroSlides = [
  {
    id: 1,
    image: "/images/drishtee-1.jpg",
    label: "RURAL LIVELIHOODS",
    title: "Creating sustainable livelihoods",
    description:
      "Building opportunities and strengthening rural communities."
  },
  {
    id: 2,
    image: "/images/drishtee-2.jpg",
    label: "WOMEN EMPOWERMENT",
    title: "Empowering rural women",
    description:
      "Supporting women to become independent and self-reliant."
  },
  {
    id: 3,
    image: "/images/drishtee-3.jpg",
    label: "COMMUNITY DEVELOPMENT",
    title: "Growing together",
    description:
      "Working with communities to create a better future."
  },
  {
    id: 4,
    image: "/images/drishtee-4.jpg",
    label: "COLLABORATION",
    title: "Creating abundance",
    description:
      "Bringing people together to build meaningful change."
  },
  {
    id: 5,
    image: "/images/drishtee-5.jpg",
    label: "SUSTAINABLE FUTURE",
    title: "Building stronger communities",
    description:
      "Creating lasting impact through local opportunities."
  }
];

function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentSlide = heroSlides[activeSlide];

  const filteredOpportunities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return opportunities;

    return opportunities.filter((item) =>
      [
        item.title,
        item.category,
        item.description,
        ...item.tags
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [searchTerm]);

  // Automatically change the hero image.
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveSlide((previous) =>
        (previous + 1) % heroSlides.length
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const showPrevious = () => {
    setActiveSlide((previous) =>
      (previous - 1 + heroSlides.length) % heroSlides.length
    );
  };

  const showNext = () => {
    setActiveSlide((previous) =>
      (previous + 1) % heroSlides.length
    );
  };

  // Reveal sections when they enter the screen.
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) =>
        element.classList.add("is-visible")
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="home-page">

      {/* HERO SECTION */}
      <section className="hero-section" id="home">

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-line"></span>
            BUILDING OPPORTUNITIES. TRANSFORMING COMMUNITIES.
          </div>

          <h1>
            Make a difference.
            <br />
            <span>Build a better future.</span>
          </h1>

          <p className="hero-description">
            Discover meaningful career opportunities at Drishtee.
            Join a team working towards empowering rural communities
            and creating sustainable livelihoods.
          </p>

          <div className="hero-actions">
            <a href="#opportunities" className="primary-button">
              Explore opportunities
              <ArrowRight size={18} />
            </a>

            <a href="#about" className="text-button">
              Discover Drishtee
              <MoveUpRight size={17} />
            </a>
          </div>

          <div className="hero-note">
            <Users size={18} />
            <span>Be part of meaningful change.</span>
          </div>
        </div>

        {/* IMAGE CAROUSEL */}
        <div
          className="hero-visual"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >

          <div className="hero-card-decoration"></div>

          <div className="hero-image-card" key={currentSlide.id}>

            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="hero-slide-image"
            />

            <div className="hero-image-overlay"></div>

            <div className="hero-image-content">
              <span className="hero-image-label">
                {currentSlide.label}
              </span>

              <h2>{currentSlide.title}</h2>

              <p>{currentSlide.description}</p>

              <Link to="/how-we-work" className="hero-image-link">
                Discover our work
                <ArrowRight size={17} />
              </Link>
            </div>

            <span className="hero-image-count">
              0{activeSlide + 1} / 0{heroSlides.length}
            </span>
          </div>

          {/* CAROUSEL CONTROLS */}
          <div className="hero-carousel-controls">

            <div className="hero-carousel-dots">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  className={`hero-dot ${
                    activeSlide === index ? "active" : ""
                  }`}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-current={activeSlide === index}
                />
              ))}
            </div>

            <div className="hero-carousel-buttons">
              <button
                onClick={showPrevious}
                aria-label="Previous image"
                className="hero-arrow"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                onClick={showNext}
                aria-label="Next image"
                className="hero-arrow"
              >
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                aria-label={isPaused ? "Play carousel" : "Pause carousel"}
                className="hero-arrow hero-play-button"
              >
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
              </button>
            </div>
          </div>

          {/* SMALL IMAGE PREVIEWS */}
          <div className="hero-thumbnail-row">
            {heroSlides.map((slide, index) => (
              <button
                type="button"
                key={slide.id}
                className={`hero-thumbnail ${
                  activeSlide === index ? "selected" : ""
                }`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Select ${slide.label}`}
              >
                <img src={slide.image} alt="" />
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* SEARCH SECTION */}
      <JobSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* OPPORTUNITY CATEGORY CARDS */}
      <section className="opportunities-section" id="opportunities">

        <div className="section-heading reveal">
          <div>
            <span className="section-label">EXPLORE CAREERS</span>
            <h2>Find where you belong.</h2>
            <p>
              Explore different ways to contribute to our mission
              and grow with Drishtee.
            </p>
          </div>

          <span className="section-side-note">
            Opportunities at Drishtee
          </span>
        </div>

        <div className="opportunity-grid">
          {filteredOpportunities.map((item, index) => {
            const Icon = item.icon;

            return (
              <article
                className={`opportunity-card ${item.color} reveal`}
                key={item.id}
                style={{ "--card-delay": `${index * 120}ms` }}
              >
                <div className="card-top">
                  <span className="card-number">{item.number}</span>

                  <div className="card-icon">
                    <Icon size={25} strokeWidth={1.8} />
                  </div>
                </div>

                <div className="card-content">
                  <span className="card-category">
                    CAREER CATEGORY
                  </span>

                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <div className="card-tags">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <Link
                  to={`/jobs?category=${encodeURIComponent(item.category)}`}
                  className="card-link"
                >
                  Explore opportunities
                  <ArrowRight size={18} />
                </Link>
              </article>
            );
          })}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="no-results">
            <BriefcaseBusiness size={30} />
            <h3>No matching categories found</h3>
            <p>
              Try searching for Vidushi, Maan Vidushi or Lateral Hiring.
            </p>

            <button onClick={() => setSearchTerm("")}>
              Clear search
            </button>
          </div>
        )}
      </section>

      {/* FEATURED JOBS */}
      <div className="reveal">
        <FeaturedJobs searchTerm={searchTerm} />
      </div>

      {/* ABOUT SECTION */}
      <section className="about-section reveal" id="about">
        <div className="about-icon">
          <HeartHandshake size={30} />
        </div>

        <div className="about-content">
          <span className="section-label">WHO WE ARE</span>

          <h2>Work that creates a meaningful impact.</h2>

          <p>
            At Drishtee, we believe that strong communities create
            a stronger future. Be part of work that supports rural
            entrepreneurship, livelihoods and development.
          </p>

          <Link to="/how-we-work" className="about-link">
            Learn more about us
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* CLOSING BANNER */}
      <section className="life-section reveal" id="life">
        <div>
          <span className="section-label">
            YOUR JOURNEY STARTS HERE
          </span>

          <h2>
            Grow with purpose.
            <br />
            Work with impact.
          </h2>

          <p>
            Explore opportunities across our organisations and
            contribute to meaningful change.
          </p>
        </div>

        <Link to="/jobs" className="light-button">
          Find your opportunity
          <ArrowRight size={18} />
        </Link>
      </section>

    </main>
  );
}

export default HomePage;
