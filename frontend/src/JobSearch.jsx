
import { Search, X } from "lucide-react";

function JobSearch({ searchTerm, onSearchChange }) {
  const handleSubmit = (event) => {
    event.preventDefault();

    document.getElementById("opportunities")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  return (
    <section className="job-search-section">
      <div className="search-heading">
        <span className="section-label">YOUR NEXT CHAPTER</span>
        <h2>Find your opportunity.</h2>
        <p>Search for a career path that matches your interests.</p>
      </div>

      <form className="search-box" onSubmit={handleSubmit}>
        <Search size={21} className="search-icon" />

        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search Vidushi, Maan Vidushi, Lateral Hiring..."
          aria-label="Search career categories"
        />

        {searchTerm && (
          <button
            type="button"
            className="clear-search"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}

        <button type="submit" className="search-submit">
          Search <Search size={17} />
        </button>
      </form>
    </section>
  );
}

export default JobSearch;
