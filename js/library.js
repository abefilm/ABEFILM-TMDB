let genreMap = {};
let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let debounceTimer;

document.addEventListener("DOMContentLoaded", function () {
  const libraryContainer = document.getElementById("library");
  if (!libraryContainer) return;

  const searchBar = document.getElementById("search-bar");
  const container = document.getElementById("library-content");
  const typeFilter = document.getElementById("type-filter");
  const statusFilter = document.getElementById("status-filter");
  const yearFilter = document.getElementById("year-filter");
  const genreFilter = document.getElementById("genre-filter");
  const countryFilter = document.getElementById("country-filter");
  const ratingFilter = document.getElementById("rating-filter");

  const waitForApiKey = setInterval(() => {
    const apiKeyEl = document.querySelector("#HTML01 .widget-content");
    if (!apiKeyEl) return;

    clearInterval(waitForApiKey);
    const apiKey = apiKeyEl.textContent.trim();
    if (!apiKey) {
      container.innerHTML = "<p>Missing API Key.</p>";
      return;
    }

    initFilters(apiKey);
    loadLibrary(apiKey, true); 
    window.addEventListener("scroll", () => handleScroll(apiKey));

    // Search input with debounce
    searchBar.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentPage = 1;
        container.innerHTML = "";
        loadLibrary(apiKey, true);
      }, 400);
    });
  }, 300);

  function initFilters(apiKey) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= 1950; y--) {
      yearFilter.innerHTML += `<option value="${y}">${y}</option>`;
    }

    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`)
      .then(res => res.json())
      .then(data => {
        data.genres.forEach(g => genreMap[g.id] = g.name);
        genreFilter.innerHTML += data.genres.map(g => `<option value="${g.id}">${g.name}</option>`).join("");
      });

    [typeFilter, statusFilter, yearFilter, genreFilter, countryFilter, ratingFilter].forEach(el => {
      el.addEventListener("change", () => {
        currentPage = 1;
        container.innerHTML = "";
        loadLibrary(apiKey, true);
      });
    });
  }

  function loadLibrary(apiKey, reset = false) {
    if (isLoading) return;
    isLoading = true;

    const type = typeFilter.value;
    const status = statusFilter.value;
    const year = yearFilter.value;
    const genre = genreFilter.value;
    const country = countryFilter.value;
    const query = searchBar.value.trim();
    const rating = ratingFilter.value;
    const isSearch = query.length >= 2;

    let url = isSearch
      ? `https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(query)}&page=${currentPage}`
      : `https://api.themoviedb.org/3/discover/${type}?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=${currentPage}`;

     if (rating) url += `&vote_average.gte=${rating}`;

    if (!isSearch) {
      if (year) url += `&primary_release_year=${year}`;
      if (genre) url += `&with_genres=${genre}`;
      if (country) url += `&with_origin_country=${country}`;
      if (status === "upcoming" && type === "movie") url += `&release_date.gte=${new Date().toISOString().split("T")[0]}`;
      if (status === "released" && type === "movie") url += `&release_date.lte=${new Date().toISOString().split("T")[0]}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (reset) container.innerHTML = "";

        if (!data.results || data.results.length === 0) {
          if (currentPage === 1) container.innerHTML = "<p>No results found.</p>";
          isLoading = false;
          return;
        }

        totalPages = data.total_pages;

        const content = data.results.map((item, index) => {
          const title = item.title || item.name || "Untitled";
          const year = (item.release_date || item.first_air_date || "").split("-")[0] || "N/A";
          const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
          const rated = item.adult ? "R" : "PG-13";
          const genres = item.genre_ids.map(id => genreMap[id]).filter(Boolean).join(", ") || "N/A";
          const overview = item.overview ? item.overview.slice(0, 160) + "…" : "No overview available.";
          const rank = ((currentPage - 1) * 20) + index + 1;

          return `
          <div class="movie-card" data-id="${item.id}" data-type="${type}">
              <div class="movie-thumbnail">
                <img src="${item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : 'https://imgur.com/YyHsyEr'}" alt="${title}">
                <div class="movie-rank rank-${rank <= 10 ? rank : 'default'}">${rank}</div>
              </div>
              <div class="movie-info">
                <div>
                  <div class="movie-title">${title}</div>
                  <div class="movie-meta">${type} • ${rating} • ${rated} • ${year}</div>
                  <div class="movie-genres"><span>${genres}</span></div>
                  <div class="movie-overview">${overview}</div>
                </div>
                <div class="movie-actions">
                 <button class="play-button" data-id="${item.id}" data-type="${type}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path d="M18.89 12.85c-.35 1.34-2.02 2.29-5.36 4.19-3.23 1.84-4.84 2.76-6.14 2.42a4.3 4.3 0 0 1-1.42-.84C5 17.61 5 15.74 5 12s0-5.61.97-6.58c.4-.4.9-.69 1.43-.83 1.3-.37 2.91.55 6.14 2.4 3.34 1.9 5.01 2.85 5.36 4.19.15.55.15 1.14 0 1.67Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                    Play
                  </button>
                </div>
              </div>
            </div>`;
        }).join("");

        container.insertAdjacentHTML("beforeend", content);
container.querySelectorAll(".movie-card, .play-button").forEach(el => {
  el.addEventListener("click", (e) => {
    e.stopPropagation(); 
    const card = e.currentTarget;
    const id = card.getAttribute("data-id");
    const type = card.getAttribute("data-type");
    if (id && type) {
      window.location.href = `${window.location.origin}/p/details.html?id=${id}&type=${type}`;
    }
  });
});

        isLoading = false;
      })
      .catch(err => {
        container.innerHTML = "<p>Error loading content.</p>";
        console.error(err);
        isLoading = false;
      });
  }

  function handleScroll(apiKey) {
    const scrollPosition = window.scrollY + window.innerHeight;
    const threshold = document.body.offsetHeight - 300;

    if (scrollPosition >= threshold && currentPage < totalPages && !isLoading) {
      currentPage++;
      loadLibrary(apiKey);
    }
  }
});
