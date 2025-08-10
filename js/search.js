document.addEventListener("DOMContentLoaded", () => {

  // This function contains all of your original logic.
  // It will only be called once the API key is safely available.
  function initializeSearch(API_KEY) {
    
    const searchInput = document.querySelector(".search-input");
    const resultsDropdown = document.getElementById("search-results");

    if (!searchInput || !resultsDropdown) {
      console.error("Search elements not found on the page.");
      return;
    }

    const genreMap = {};

    // PRESERVED: Your original function
    async function loadGenres() {
      try {
        const [movieRes, tvRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`).then(res => res.json()),
          fetch(`https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}&language=en-US`).then(res => res.json())
        ]);
        [...(movieRes.genres || []), ...(tvRes.genres || [])].forEach(g => genreMap[g.id] = g.name);
      } catch (err) {
        console.error("Failed to load genres:", err);
      }
    }

    // PRESERVED: Your original function
    async function getRating(type, id) {
      // The rating call is only relevant for movies in this API endpoint
      if (type !== 'movie') return "N/A";
      const url = `https://api.themoviedb.org/3/${type}/${id}/release_dates?api_key=${API_KEY}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const usRelease = data.results?.find(r => r.iso_3166_1 === "US");
        if (!usRelease || !usRelease.release_dates?.length) return "NR"; // Not Rated
        return usRelease.release_dates[0].certification || "NR";
      } catch {
        return "NR";
      }
    }

    // PRESERVED: Your original function
    async function searchMulti(query) {
      const url = `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=en-US`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        return data.results || [];
      } catch (err) {
        return [];
      }
    }

    // PRESERVED: Your original function with all features
    function showResults(results) {
      resultsDropdown.innerHTML = "";
      
      const validResults = results.filter(item => 
        ["movie", "tv"].includes(item.media_type) && item.poster_path
      ).slice(0, 6);

      if (validResults.length === 0) {
        resultsDropdown.style.display = "none";
        return;
      }

      validResults.forEach(async (item) => {
        const title = item.title || item.name || "Untitled";
        const poster = `https://image.tmdb.org/t/p/w92${item.poster_path}`;
        const year = (item.release_date || item.first_air_date || "").split("-")[0] || "N/A";
        const type = item.media_type === "movie" ? "Movie" : "TV Show";
        const genres = (item.genre_ids || []).map(id => genreMap[id]).filter(Boolean).join(", ") || "Unknown";
        
        // This makes sure the rating is fetched before the item is added
        const rating = await getRating(item.media_type, item.id);

        const li = document.createElement("li");
        li.innerHTML = `
          <img src="${poster}" alt="${title}">
          <div class="search-info">
            <p>${title}</p>
            <small>Type: ${type} | Year: ${year}</small>
            <small>Genres: ${genres}</small>
            <small>Rating: ${rating}</small>
          </div>
        `;

        li.addEventListener("click", () => {
          const url = `/p/details.html?id=${item.id}&type=${item.media_type}`;
          window.location.href = url;
        });

        resultsDropdown.appendChild(li);
      });

      resultsDropdown.style.display = "block";
    }

    // PRESERVED: Your original event listener logic
    let debounceTimeout;
    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim();
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(async () => {
        if (query.length >= 2) {
          const results = await searchMulti(query);
          showResults(results);
        } else {
          resultsDropdown.style.display = "none";
        }
      }, 300);
    });

    // Start the initial genre load
    loadGenres();
  }

  // --- NEW WAITING LOGIC ---
  // This function polls for window.apiKey and starts the main logic when it's ready.
  function waitForApiKey() {
    let attempts = 0;
    const maxAttempts = 50; // Try for 5 seconds
    
    const interval = setInterval(() => {
      if (window.apiKey) {
        clearInterval(interval);
        // Call your main function once the key is ready
        initializeSearch(window.apiKey);
      } 
      else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.error("API Key (window.apiKey) was not found after 5 seconds. Check HTML01 widget.");
      }
      attempts++;
    }, 100); // Check every 100ms
  }

  // PRESERVED: Your global click listener to hide the dropdown
  document.addEventListener("click", (e) => {
    const resultsDropdown = document.getElementById("search-results");
    if (resultsDropdown && !e.target.closest(".search-input-wrapper")) {
      resultsDropdown.style.display = "none";
    }
  });

  // Start the entire process by waiting for the key
  waitForApiKey();

});
