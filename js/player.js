window.addEventListener("DOMContentLoaded", () => {
  if (!window.location.href.includes("/p/player.html")) return;

  const apiKeyEl = document.querySelector("#HTML01 .widget-content");
  const API_KEY = apiKeyEl?.textContent.trim();
  if (!API_KEY) {
    console.error("API Key not found.");
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  const type = urlParams.get("type");
  const epParam = parseInt(urlParams.get("ep") || "1");
  const SEASON_NUMBER = 1;

  const playerEl = document.getElementById("video-left");
  const episodeButtons = document.getElementById("player-episode-buttons");
  const serverButtons = document.getElementById("server-buttons");

  let currentEpisode = epParam;
  let currentServer = null;
  let servers = {};

  function loadServerTemplates() {
    const serverSection = document.getElementById("video-sources");
    if (!serverSection) return;

    const widgets = serverSection.querySelectorAll(".widget");
    widgets.forEach(widget => {
      const title = widget.querySelector(".widget-title, .title")?.textContent.trim().toLowerCase();
      const content = widget.querySelector(".widget-content")?.textContent.trim();
      if (title && content) {
        const lines = content.split("\n").map(line => line.trim()).filter(Boolean);
        let movieTemplate = null;
        let tvTemplate = null;

        for (const line of lines) {
          if (/\${episode}/.test(line)) {
            tvTemplate = line;
          } else if (/\${id}/.test(line)) {
            movieTemplate = line;
          }
        }

        servers[title] = {
          movie: id => movieTemplate ? movieTemplate.replace(/\$\{id\}/g, id) : "",
          tv: (id, season, episode) => tvTemplate
            ? tvTemplate.replace(/\$\{id\}/g, id).replace(/\$\{season\}/g, season).replace(/\$\{episode\}/g, episode)
            : ""
        };
      }
    });
  }

  function setIframeSrc(episode = 1) {
    currentEpisode = episode;
    const server = servers[currentServer];
    if (!server) return;

    const src = type === "movie"
      ? server.movie(id)
      : server.tv(id, SEASON_NUMBER, episode);

    playerEl.innerHTML = src
      ? `<iframe src="${src}" frameborder="0" allowfullscreen loading="lazy" style="width:100%;height:100%;max-height:100vh;"></iframe>
`
      : `<p style='color:white'>Invalid or missing source URL.</p>`;
  }

  function createServerButtons() {
    Object.keys(servers).forEach(key => {
      const btn = document.createElement("button");
      btn.textContent = key.toUpperCase();
      btn.className = "server-btn";
      if (!currentServer) currentServer = key;
      if (key === currentServer) btn.classList.add("active");

      btn.addEventListener("click", () => {
        document.querySelectorAll(".server-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentServer = key;
        setIframeSrc(currentEpisode);
      });

      serverButtons.appendChild(btn);
    });
  }

  function createEpisodeButtons(totalEpisodes) {
    for (let i = 1; i <= totalEpisodes; i++) {
      const btn = document.createElement("button");
      btn.textContent = `${i}`;
      btn.className = "player-episode-btn";

      btn.addEventListener("click", () => {
        document.querySelectorAll(".player-episode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        setIframeSrc(i);
      });

      episodeButtons.appendChild(btn);
    }

    const first = episodeButtons.querySelector(".player-episode-btn");
    const episodeBtns = episodeButtons.querySelectorAll(".player-episode-btn");
const targetBtn = episodeBtns[epParam - 1] || episodeBtns[0]; 
targetBtn.classList.add("active");
setIframeSrc(epParam);
  }

  function createMovieEpisodeDummy() {
    const btn = document.createElement("button");
    btn.textContent = "1";
    btn.className = "player-episode-btn active";

    btn.addEventListener("click", () => {
      document.querySelectorAll(".player-episode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setIframeSrc(1);
    });

    episodeButtons.appendChild(btn);
  }

 function populateFooter(info) {
  const footer = document.getElementById("footer-bottom");
  if (!footer) return;

  const {
    title, name, overview, genres, status, vote_average,
    first_air_date, release_date, runtime, episode_run_time,
    number_of_episodes, content_ratings
  } = info;

  const typeText = number_of_episodes ? "TV" : "Movie";
  const year = (release_date || first_air_date || "").split("-")[0] || "N/A";
  const rating = vote_average ? vote_average.toFixed(1) : "N/A";
  const runtimeText = runtime || episode_run_time?.[0] || "?";
  const genreList = genres?.map(g => g.name).join(", ") || "Unknown";
  const statusText = status || "Unknown";
  const cert = info.certification ||
               info.content_ratings?.results?.find(c => c.iso_3166_1 === "US")?.rating ||
               "NR";

  footer.innerHTML = `
    <div class="footer-left">
      <div class="footer-title-rating">
        <strong>${title || name || "Untitled"} (${year})</strong>
      </div>
      <div class="footer-meta">
        <span class="footer-rating">⭐ ${rating}</span>
        <span class="type-meta">${typeText}</span> • 
        <span>${statusText}</span> • 
        <span>Rated: ${cert}</span>
      </div>
      <div class="footer-genres"><strong>Genres:</strong> ${genreList}</div>
      <div class="footer-overview">${overview || "No overview available."}</div>
<span class="read-more-toggle">More</span>

    </div>
    <div class="footer-right">
      <h3>Recommended</h3>
      <div class="recommendation-grid"></div>
    </div>
  `;

const overviewEl = footer.querySelector(".footer-overview");
const toggleBtn = footer.querySelector(".read-more-toggle");

if (overviewEl && toggleBtn && window.innerWidth <= 768) {
  toggleBtn.addEventListener("click", () => {
    overviewEl.classList.toggle("expanded");
    toggleBtn.textContent = overviewEl.classList.contains("expanded") ? "Less" : "More";
  });
}

  fetch(`https://api.themoviedb.org/3/${number_of_episodes ? "tv" : "movie"}/${info.id}/credits?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const cast = data.cast?.slice(0, 6);
      if (cast?.length > 0) {
        const castWrapper = document.createElement("div");
        castWrapper.className = "footer-cast-scroll-wrapper";
        castWrapper.innerHTML = `
  <h4>Cast</h4>
  <div class="cast-scroll-wrapper">
    <button class="cast-scroll-btn left" aria-label="Scroll Left">‹</button>
    <div class="cast-scroll">
      ${cast.map(actor => {
        const img = actor.profile_path
          ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
          : "https://i.imgur.com/obaaZjk.png";
        return `
          <div class="cast-card">
            <img src="${img}" alt="${actor.name}" onerror="this.onerror=null;this.src='https://i.imgur.com/obaaZjk.png';">
            <div class="cast-name">${actor.name}</div>
            <div class="cast-role">${actor.character}</div>
          </div>
        `;
      }).join("")}
    </div>
    <button class="cast-scroll-btn right" aria-label="Scroll Right">›</button>
  </div>
`;
      footer.querySelector(".footer-left").appendChild(castWrapper);
      }
    }) 
    .catch(err => {
      console.error("Cast Fetch Error:", err);
    });
}

  function fetchRecommendations(id, type) {
    const container = document.querySelector(".recommendation-grid");
    if (!container) return;

    const endpoint =
      type === "movie"
        ? `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${API_KEY}`
        : `https://api.themoviedb.org/3/tv/${id}/recommendations?api_key=${API_KEY}`;

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        const results = data.results?.slice(0, 6);
        if (!results || results.length === 0) {
          container.innerHTML = "<p style='color:#ccc'>No recommendations available.</p>";
          return;
        }

        container.innerHTML = results.map(item => {
          const title = item.title || item.name || "Untitled";
          const poster = item.poster_path
            ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
            : "https://i.imgur.com/YyHsyEr.png";

          const mediaType = type === "movie" ? "movie" : "tv";

          return `
            <div class="rec-item">
  <a href="/p/player.html?id=${item.id}&type=${mediaType}">
    <div class="rec-thumb">
      <img src="${poster}" alt="${title}" onerror="this.onerror=null;this.src='https://i.imgur.com/YyHsyEr.png';">
     <div class="abefilm-hover-overlay"></div>
 <div class="abefilm-play-button">
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="var(--keycolor)"/>
          <path d="M15.4137 13.059L10.6935 15.8458C9.93371 16.2944 9 15.7105 9 14.7868V9.21316C9 8.28947 9.93371 7.70561 10.6935 8.15419L15.4137 10.941C16.1954 11.4026 16.1954 12.5974 15.4137 13.059Z" fill="#FFFFFF"/>
        </svg>
      </div>
    </div>
    <span>${title}</span>
  </a>
</div>
`;
        }).join("");
      })
      .catch(err => {
        console.error("Recommendation Fetch Error:", err);
        container.innerHTML = "<p style='color:#ccc'>Failed to load recommendations.</p>";
      });
  }

  // Main logic
  if (id && type) {
    loadServerTemplates();

    if (Object.keys(servers).length > 0) {
      createServerButtons();
      setIframeSrc(currentEpisode);
    } else {
      playerEl.innerHTML = "<p style='color:white'>No server templates found.</p>";
    }

    if (type === "tv") {
      fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(info => {
          populateFooter(info);
          fetchRecommendations(info.id, type);
        });

      fetch(`https://api.themoviedb.org/3/tv/${id}/season/${SEASON_NUMBER}?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
          const totalEpisodes = data.episodes?.length || 0;
          if (totalEpisodes > 0) {
            createEpisodeButtons(totalEpisodes);
          } else {
            episodeButtons.innerHTML = "<p style='color:white'>No episodes found.</p>";
          }
        });
    } else if (type === "movie") {
      fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`)
        .then(res => res.json())
        .then(info => {
          populateFooter(info);
          fetchRecommendations(info.id, type);
        });

      createMovieEpisodeDummy();
      setIframeSrc();
    }
  } else {
    playerEl.innerHTML = "<p style='color:white'>Missing ID or type in URL.</p>";
  }
});
