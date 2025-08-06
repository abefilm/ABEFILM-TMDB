const apiKeyEl = document.querySelector("#HTML01 .widget-content");
const endpointEl = document.querySelector("#Text1 .widget-content");
const API_KEY = apiKeyEl?.textContent.trim();
const BASE_URL = endpointEl?.textContent.trim() || "https://api.themoviedb.org/3";
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const type = params.get("type") || "movie";
const container = document.getElementById("movie-details-container");

async function fetchData() {
  if (!id || !type) {
    container.innerHTML = "<p>Missing ID or type.</p>";
    return;
  }

  try {
    const [detailRes, creditsRes, ratingRes] = await Promise.all([
      fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US`),
      fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}&language=en-US`),
      fetch(`${BASE_URL}/${type}/${id}/${type === "movie" ? "release_dates" : "content_ratings"}?api_key=${API_KEY}`)
    ]);

    const data = await detailRes.json();
    const credits = await creditsRes.json();
    const ratingData = await ratingRes.json();

    const certification = getCertification(type, ratingData);

    renderDetails(data, credits, certification);

    if (type === "tv") {
      renderSeasons(data.seasons);
    } else {
      renderMovieEpisode(id);
    }

    await fetchRecommendations();

    const castWrap = document.getElementById("cast-list");
    if (castWrap) {
      castWrap.innerHTML = credits.cast.slice(0, 15).map(cast => `
        <div class="cast-card">
          <img src="${cast.profile_path ? IMG_URL + cast.profile_path : 'https://i.imgur.com/obaaZjk.png'}" alt="${cast.name}">
          <div>${cast.name}</div>
          <small>${cast.character}</small>
        </div>
      `).join('');
    }

if (castWrap && credits.cast?.length > 0) {
  const castHTML = credits.cast.slice(0, 15).map(cast => `
    <div class="cast-card">
      <img src="${cast.profile_path ? IMG_URL + cast.profile_path : 'https://i.imgur.com/obaaZjk.png'}" alt="${cast.name}">
      <div>${cast.name}</div>
      <small>${cast.character}</small>
    </div>
  `).join('');

  const wrapper = document.createElement("div");
  wrapper.className = "cast-scroll-wrapper";
  wrapper.innerHTML = `
    <button class="scroll-btn left" aria-label="Scroll Left">‹</button>
    <div class="cast-scroll">${castHTML}</div>
    <button class="scroll-btn right" aria-label="Scroll Right">›</button>
  `;

  castWrap.replaceWith(wrapper);

  const scrollContainer = wrapper.querySelector(".cast-scroll");
const leftBtn = wrapper.querySelector(".scroll-btn.left");
const rightBtn = wrapper.querySelector(".scroll-btn.right");

const card = wrapper.querySelector('.cast-card');
const cardStyle = getComputedStyle(card);
const cardGap = parseInt(cardStyle.marginRight || 0);
const cardWidth = card.offsetWidth + cardGap;

leftBtn.onclick = () => {
  scrollContainer.scrollBy({
    left: -cardWidth * 2.5, 
    behavior: 'smooth'
  });
};

rightBtn.onclick = () => {
  scrollContainer.scrollBy({
    left: cardWidth * 2.5, 
    behavior: 'smooth'
  });
};
}


const reviewWrap = document.getElementById("user-reviews");
try {
  const reviewRes = await fetch(`${BASE_URL}/${type}/${id}/reviews?api_key=${API_KEY}&language=en-US`);
  const reviewData = await reviewRes.json();

  if (reviewWrap) {
    if (reviewData.results && reviewData.results.length > 0) {
      reviewWrap.innerHTML = reviewData.results.slice(0, 5).map(review => {
        const authorName = review.author || "Anonymous";
        const avatarPath = review.author_details?.avatar_path;
        const avatar = avatarPath
          ? avatarPath.startsWith('/https') ? avatarPath.slice(1) : `https://image.tmdb.org/t/p/w45${avatarPath}`
          : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(authorName); 

        const createdAt = new Date(review.created_at).toLocaleDateString();

        return `
          <div class="user-review">
            <div class="review-header">
              <img class="review-avatar" src="${avatar}" alt="${authorName}'s profile">
              <div>
                <strong>${authorName}</strong><br>
                <small>${createdAt}</small>
              </div>
            </div>
            <p class="review-content">
              ${review.content.length > 300 ? review.content.substring(0, 300) + "..." : review.content}
            </p>
          </div>
        `;
      }).join('');
    } else {
      reviewWrap.innerHTML = "<p>No user reviews available.</p>";
    }
  }
} catch (error) {
  console.error("Failed to fetch user reviews:", error);
  if (reviewWrap) {
    reviewWrap.innerHTML = "<p>Failed to load user reviews.</p>";
  }
}


  } catch (err) {
    container.innerHTML = "<p>Error fetching details.</p>";
    console.error(err);
  }
}

function getCertification(type, ratingData) {
  if (type === "movie") {
    const us = ratingData.results?.find(r => r.iso_3166_1 === "US");
    return us?.release_dates?.[0]?.certification || "NR";
  } else {
    const us = ratingData.results?.find(r => r.iso_3166_1 === "US");
    return us?.rating || "NR";
  }
}

function renderDetails(data, credits, certification) {
  const title = data.title || data.name;
  const year = (data.release_date || data.first_air_date || "").split("-")[0] || "Unknown";
  const genres = data.genres?.map(g => g.name).join('<span>|</span>') || "Unknown";
  const rating = data.vote_average?.toFixed(1) || "N/A";
  const voteCount = data.vote_count?.toLocaleString() || "0";
  const overview = data.overview || "No synopsis available.";
  const poster = data.poster_path ? `${IMG_URL}${data.poster_path}` : "";
  const backdrop = data.backdrop_path ? `${IMG_URL}${data.backdrop_path}` : "";
  const country = data.origin_country?.[0] || data.production_countries?.[0]?.name || "Unknown";
  const metaType = type === "tv" ? "TV" : "Movie";

  container.innerHTML = `
    <div class="detail-wrap">
      <div class="info-rating-wrapper">
   
     
<div class="poster" style="--backdrop-url: url('${backdrop}')">
  <img src="${poster}" alt="${title}" />
  <div class="poster-play-btn" data-id="${id}" data-type="${type}"> 
    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="transparent"></path>
      <path d="M15.4137 13.059L10.6935 15.8458C9.93371 16.2944 9 15.7105 9 14.7868V9.21316C9 8.28947 9.93371 7.70561 10.6935 8.15419L15.4137 10.941C16.1954 11.4026 16.1954 12.5974 15.4137 13.059Z" fill="#FFFFFF"></path>
    </svg>
  </div>
</div>

<div id="trailer-container" class="hidden"></div>
<div id="trailer-modal">
  <div id="modal-trailer-container"></div>
  <div class="close-btn">&times;</div>
</div>


        <div class="info">
          <h1>${title}</h1>
          <div class="meta">
            ${metaType} <span>|</span> ${year} <span>|</span> ${certification} <span>|</span> ${country} <span>|</span> ${genres}
          </div>
          <p class="tagline">${overview}</p>
          <div class="buttons">
            <button class="watch" onclick="goToPlayer()"><i class="bi bi-play-fill"></i> Watch Free</button>
            <button class="share"><i class="bi bi-box-arrow-up-right"></i> Share</button>
          </div>
        </div>
        <div class="rating">
          <i class="bi bi-star-fill"></i>
          <strong>${rating}</strong><span>/10</span>
          <div class="vote-count">(${voteCount} people rated)</div>
        </div>
      </div>
    </div>

  

    <div class="episode-placeholder" id="section-episodes">
       <h3>Episodes</h3>
     <div class="episode-wrapper">
      <div id="season-buttons" class="season-wrap"></div>
      <div id="episode-buttons" class="episode-wrap"></div>
    </div>
    </div>
    <div class="details-extra-section">
      <div class="left-column">
        <div class="top-cast" id="section-cast">
        <h3>Top Cast</h3>
        <div id="cast-list" class="cast-scroll"></div>
          </div>
       <div class="user-reviews">
        <h3>User Reviews</h3>
        <div id="user-reviews" id="section-reviews"></div>
         </div>
        <div id="disqus_thread" id="section-comments"></div>
      </div>
      <div class="right-column">
        <h3>More Like This</h3>
        <div id="more-like-grid" class="more-like-grid"></div>
      </div>
    </div>
  `;
}

async function renderSeasons(seasons) {
  const seasonBtnWrap = document.getElementById("season-buttons");
  seasonBtnWrap.innerHTML = "";
  seasons.forEach((season, index) => {
    if (season.season_number === 0) return;
    const btn = document.createElement("button");
    btn.className = "ep-btn season-btn" + (index === 1 ? " active" : "");
    btn.textContent = `S${season.season_number}`;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".season-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderEpisodes(season.season_number);
    });
    seasonBtnWrap.appendChild(btn);
  });

  const first = seasons.find(s => s.season_number === 1);
  if (first) renderEpisodes(first.season_number);
}

async function renderEpisodes(seasonNum) {
  const res = await fetch(`${BASE_URL}/tv/${id}/season/${seasonNum}?api_key=${API_KEY}&language=en-US`);
  const data = await res.json();
  const episodeWrap = document.getElementById("episode-buttons");
  episodeWrap.innerHTML = "";

  const isMobile = window.innerWidth <= 600;
  const maxVisible = isMobile ? 14 : 35;
  let isExpanded = false;

  const renderEpButtons = (episodes, showAll = false) => {
    episodeWrap.innerHTML = "";
    const list = showAll ? episodes : episodes.slice(0, maxVisible);

    list.forEach(ep => {
      const btn = document.createElement("button");
      btn.className = "btn episode-btn";
      btn.textContent = String(ep.episode_number).padStart(2, "0");
     btn.addEventListener("click", () => {
  window.location.href = `/p/player.html?id=${id}&type=tv&season=${seasonNum}&ep=${ep.episode_number}`;
});
      episodeWrap.appendChild(btn);
    });

    if (episodes.length > maxVisible) {
      const toggleBtn = document.createElement("button");
      toggleBtn.className = `btn episode-btn ${showAll ? "hide-btn" : "show-more"}`;
      toggleBtn.textContent = showAll ? "Hide" : "More";
      toggleBtn.addEventListener("click", () => {
        isExpanded = !isExpanded;
        renderEpButtons(episodes, isExpanded);
      });
      episodeWrap.appendChild(toggleBtn);
    }
  };

  renderEpButtons(data.episodes, isExpanded);
}

async function renderMovieEpisode(movieId) {
  const seasonBtnWrap = document.getElementById("season-buttons");
  const episodeWrap = document.getElementById("episode-buttons");

  seasonBtnWrap.innerHTML = "";
  episodeWrap.innerHTML = "";

  const movieRes = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
  const movieData = await movieRes.json();

  if (movieData.belongs_to_collection) {
    const collectionId = movieData.belongs_to_collection.id;
    const collectionRes = await fetch(`https://api.themoviedb.org/3/collection/${collectionId}?api_key=${API_KEY}`);
    const collectionData = await collectionRes.json();

    const sortedParts = collectionData.parts.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));

    sortedParts.forEach((part, index) => {
      const seasonBtn = document.createElement("button");
      seasonBtn.className = "ep-btn season-btn" + (part.id == movieId ? " active" : "");
      seasonBtn.textContent = `Part ${index + 1}`;
      seasonBtn.addEventListener("click", () => {
        window.location.href = `https://abefilmv5official.blogspot.com/p/details.html?id=${part.id}&type=movie`;
      });
      seasonBtnWrap.appendChild(seasonBtn);
    });

    const epBtn = document.createElement("button");
epBtn.className = "btn episode-btn";
epBtn.textContent = "01";
epBtn.addEventListener("click", () => {
  window.location.href = `/p/player.html?id=${movieId}&type=movie`;
});
episodeWrap.appendChild(epBtn);

  } else {
    const seasonBtn = document.createElement("button");
    seasonBtn.className = "ep-btn season-btn active";
    seasonBtn.textContent = "S1";
    seasonBtnWrap.appendChild(seasonBtn);

    const epBtn = document.createElement("button");
    epBtn.className = "btn episode-btn";
    epBtn.textContent = "01";
epBtn.addEventListener("click", () => {
  const movieId = new URLSearchParams(window.location.search).get("id");
  const movieType = new URLSearchParams(window.location.search).get("type") || "movie";
  window.location.href = `/p/player.html?id=${movieId}&type=${movieType}`;
});

    episodeWrap.appendChild(epBtn);
  }
}

async function fetchRecommendations() {
  const wrap = document.getElementById("more-like-grid");
  wrap.innerHTML = "";

  try {
    const res = await fetch(`${BASE_URL}/${type}/${id}/recommendations?api_key=${API_KEY}&language=en-US`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      wrap.innerHTML = "<p>No recommendations available.</p>";
      return;
    }

    data.results.slice(0, 12).forEach((item) => {
      const link = document.createElement("a");
      link.href = `./details.html?id=${item.id}&type=${type}`;
      link.className = "more-like-item abefilm-hover-card"; 

      const imageWrap = document.createElement("div");
      imageWrap.className = "abefilm-image-wrap"; 

      const image = document.createElement("img");
image.src = item.poster_path
  ? `${IMG_URL}${item.poster_path}`
  : "https://i.imgur.com/YyHsyEr.png";
image.alt = item.title || item.name;
image.onerror = () => {
  image.src = "https://i.imgur.com/YyHsyEr.png";
};


      const playButton = document.createElement("div");
      playButton.className = "abefilm-play-button";
      playButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="var(--keycolor)"></path>
            <path d="M15.4137 13.059L10.6935 15.8458C9.93371 16.2944 9 15.7105 9 14.7868V9.21316C9 8.28947 9.93371 7.70561 10.6935 8.15419L15.4137 10.941C16.1954 11.4026 16.1954 12.5974 15.4137 13.059Z" fill="#FFFFFF"></path>
          </svg>
      `;

      const title = document.createElement("p");
      title.textContent = item.title || item.name;

      imageWrap.appendChild(image);
const overlay = document.createElement("div");
overlay.className = "abefilm-hover-overlay";
imageWrap.appendChild(overlay);

imageWrap.appendChild(playButton);

      link.appendChild(imageWrap);
      link.appendChild(title);
      wrap.appendChild(link);
    });

  } catch (error) {
    console.error("Failed to fetch recommendations:", error);
    wrap.innerHTML = "<p>Failed to load recommendations.</p>";
  }
}


document.addEventListener("click", function (e) {
  if (e.target.closest(".share")) {
    const shareUrl = window.location.href;
    const title = document.querySelector(".info h1")?.innerText || "Check this out!";
    const text = "Watch this on AbeFilm:";

    if (navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: shareUrl
      }).then(() => console.log("Shared successfully"))
        .catch((err) => console.error("Share failed:", err));
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert("Link copied to clipboard!"))
        .catch(() => prompt("Copy this link manually:", shareUrl));
    }
  }
});

fetchData();

document.addEventListener("click", async function (e) {
  const btn = e.target.closest(".poster-play-btn");
  if (!btn) return;

  const movieId = btn.getAttribute("data-id");
  const movieType = btn.getAttribute("data-type") || "movie";
  const trailerContainer = document.getElementById("modal-trailer-container");
  const modal = document.getElementById("trailer-modal");

  try {
    const res = await fetch(`${BASE_URL}/${movieType}/${movieId}/videos?api_key=${API_KEY}&language=en-US`);
    const data = await res.json();
    const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");

    if (trailer) {
      trailerContainer.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" 
                allowfullscreen 
                allow="autoplay; encrypted-media" 
                frameborder="0">
        </iframe>
      `;
    } else {
      trailerContainer.innerHTML = "<p>No trailer found.</p>";
    }

    modal.classList.add("active");

  } catch (err) {
    console.error("Failed to fetch trailer:", err);
    trailerContainer.innerHTML = "<p>Error loading trailer.</p>";
    modal.classList.add("active");
  }
});
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("close-btn")) {
    const modal = document.getElementById("trailer-modal");
    const trailerContainer = document.getElementById("modal-trailer-container");

    modal.classList.remove("active");
    trailerContainer.innerHTML = ""; 
  }
});


  function goToPlayer() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const type = params.get('type');

    if (id && type) {
      window.location.href = `/p/player.html?id=${id}&type=${type}`;
    } else {
      alert("Missing ID or type in URL.");
    }
  }
