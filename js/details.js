document.addEventListener('DOMContentLoaded', () => {

  // This is the main function that contains all of your page logic.
  // It will only be called after the API key is safely available.
  function initializeApp(API_KEY) {

    // --- NEW: Create Custom Notification Element (without styles) ---
    function setupToastNotification() {
      // Check if the element already exists to avoid duplicates
      if (document.getElementById('custom-toast-notification')) return;
      
      const toastHTML = document.createElement('div');
      toastHTML.id = 'custom-toast-notification';
      document.body.appendChild(toastHTML);
    }
    // --- END NEW SECTION ---

    const endpointEl = document.querySelector("#Text1 .widget-content");
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
          wrapper.innerHTML = `<button class="scroll-btn left" aria-label="Scroll Left">‹</button><div class="cast-scroll">${castHTML}</div><button class="scroll-btn right" aria-label="Scroll Right">›</button>`;
          castWrap.replaceWith(wrapper);
          const scrollContainer = wrapper.querySelector(".cast-scroll");
          const leftBtn = wrapper.querySelector(".scroll-btn.left");
          const rightBtn = wrapper.querySelector(".scroll-btn.right");
          const card = wrapper.querySelector('.cast-card');
          const cardStyle = getComputedStyle(card);
          const cardGap = parseInt(cardStyle.marginRight || 0);
          const cardWidth = card.offsetWidth + cardGap;
          leftBtn.onclick = () => scrollContainer.scrollBy({ left: -cardWidth * 2.5, behavior: 'smooth' });
          rightBtn.onclick = () => scrollContainer.scrollBy({ left: cardWidth * 2.5, behavior: 'smooth' });
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
                const avatar = avatarPath ? (avatarPath.startsWith('/https') ? avatarPath.slice(1) : `https://image.tmdb.org/t/p/w45${avatarPath}`) : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(authorName);
                const createdAt = new Date(review.created_at).toLocaleDateString();
                return `<div class="user-review"><div class="review-header"><img class="review-avatar" src="${avatar}" alt="${authorName}'s profile"><div><strong>${authorName}</strong><br><small>${createdAt}</small></div></div><p class="review-content">${review.content.length > 300 ? review.content.substring(0, 300) + "..." : review.content}</p></div>`;
              }).join('');
            } else {
              reviewWrap.innerHTML = "<p>No user reviews available.</p>";
            }
          }
        } catch (error) {
          if (reviewWrap) reviewWrap.innerHTML = "<p>Failed to load user reviews.</p>";
        }
      } catch (err) {
        container.innerHTML = "<p>Error fetching details.</p>";
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
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="transparent"></path><path d="M15.4137 13.059L10.6935 15.8458C9.93371 16.2944 9 15.7105 9 14.7868V9.21316C9 8.28947 9.93371 7.70561 10.6935 8.15419L15.4137 10.941C16.1954 11.4026 16.1954 12.5974 15.4137 13.059Z" fill="#FFFFFF"></path></svg>
              </div>
            </div>
            <div id="trailer-modal"><div id="modal-trailer-container"></div><div class="close-btn">&times;</div></div>
            <div class="info">
              <h1>${title}</h1>
              <div class="meta">${metaType} <span>|</span> ${year} <span>|</span> ${certification} <span>|</span> ${country} <span>|</span> ${genres}</div>
              <p class="tagline">${overview}</p>
              <div class="buttons">
                <button class="watch" onclick="goToPlayer()"><i class="bi bi-play-fill"></i> Watch Now</button>
                <button class="bookmark" onclick="bookmarkItem()"><i class="bi bi-bookmark"></i> Add to Watchlist</button>
                <button class="share"><i class="bi bi-box-arrow-up-right"></i> Share</button>
              </div>
            </div>
            <div class="rating">
              <i class="bi bi-star-fill"></i><strong>${rating}</strong><span>/10</span><div class="vote-count">(${voteCount} people rated)</div>
            </div>
          </div>
        </div>
        <div class="episode-placeholder" id="section-episodes"><h3>Episodes</h3><div class="episode-wrapper"><div id="season-buttons" class="season-wrap"></div><div id="episode-buttons" class="episode-wrap"></div></div></div>
        <div class="details-extra-section"><div class="left-column"><div class="top-cast" id="section-cast"><h3>Top Cast</h3><div id="cast-list" class="cast-scroll"></div></div><div class="user-reviews"><h3>User Reviews</h3><div id="user-reviews" id="section-reviews"></div></div></div><div class="right-column"><h3>More Like This</h3><div id="more-like-grid" class="more-like-grid"></div></div></div>`;
    }

    async function renderSeasons(seasons) {
      const seasonBtnWrap = document.getElementById("season-buttons");
      seasonBtnWrap.innerHTML = "";
      seasons.forEach((season, index) => {
        if (season.season_number === 0) return;
        const btn = document.createElement("button");
        btn.className = "ep-btn season-btn" + (index === 1 ? " active" : "");
        btn.textContent = `S${season.season_number}`;
        btn.onclick = () => {
          document.querySelectorAll(".season-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          renderEpisodes(season.season_number);
        };
        seasonBtnWrap.appendChild(btn);
      });
      const first = seasons.find(s => s.season_number === 1);
      if (first) renderEpisodes(first.season_number);
    }

    async function renderEpisodes(seasonNum) {
      const res = await fetch(`${BASE_URL}/tv/${id}/season/${seasonNum}?api_key=${API_KEY}&language=en-US`);
      const data = await res.json();
      const episodeWrap = document.getElementById("episode-buttons");
      const titleEl = document.querySelector(".info h1");
      if (titleEl) {
        const originalTitle = titleEl.dataset.originalTitle || titleEl.innerText.split(" S")[0];
        titleEl.innerText = `${originalTitle} S${seasonNum}`;
        titleEl.dataset.originalTitle = originalTitle;
      }
      const isMobile = window.innerWidth <= 600;
      const maxVisible = isMobile ? 14 : 35;
      const renderEpButtons = (episodes, showAll = false) => {
        episodeWrap.innerHTML = "";
        const list = showAll ? episodes : episodes.slice(0, maxVisible);
        list.forEach(ep => {
          const btn = document.createElement("button");
          btn.className = "btn episode-btn";
          btn.textContent = String(ep.episode_number).padStart(2, "0");
          btn.onclick = () => window.location.href = `/p/player.html?id=${id}&type=tv&season=${seasonNum}&ep=${ep.episode_number}`;
          episodeWrap.appendChild(btn);
        });
        if (episodes.length > maxVisible) {
          const toggleBtn = document.createElement("button");
          toggleBtn.className = `btn episode-btn ${showAll ? "hide-btn" : "show-more"}`;
          toggleBtn.textContent = showAll ? "Hide" : "More";
          toggleBtn.onclick = () => renderEpButtons(data.episodes, !showAll);
          episodeWrap.appendChild(toggleBtn);
        }
      };
      if(data.episodes) renderEpButtons(data.episodes, false);
    }

    async function renderMovieEpisode(movieId) {
      const seasonBtnWrap = document.getElementById("season-buttons");
      const episodeWrap = document.getElementById("episode-buttons");
      seasonBtnWrap.innerHTML = "";
      episodeWrap.innerHTML = "";
      const movieRes = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
      const movieData = await movieRes.json();
      if (movieData.belongs_to_collection) {
        const collectionRes = await fetch(`https://api.themoviedb.org/3/collection/${movieData.belongs_to_collection.id}?api_key=${API_KEY}`);
        const collectionData = await collectionRes.json();
        const sortedParts = collectionData.parts.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
        sortedParts.forEach((part, index) => {
          const seasonBtn = document.createElement("button");
          seasonBtn.className = "ep-btn season-btn" + (part.id == movieId ? " active" : "");
          seasonBtn.textContent = `Part ${index + 1}`;
          seasonBtn.onclick = () => window.location.href = `${window.location.origin}/p/details.html?id=${part.id}&type=movie`;
          seasonBtnWrap.appendChild(seasonBtn);
        });
      } else {
        const seasonBtn = document.createElement("button");
        seasonBtn.className = "ep-btn season-btn active";
        seasonBtn.textContent = "S1";
        seasonBtnWrap.appendChild(seasonBtn);
      }
      const epBtn = document.createElement("button");
      epBtn.className = "btn episode-btn";
      epBtn.textContent = "01";
      epBtn.onclick = () => window.location.href = `/p/player.html?id=${movieId}&type=movie`;
      episodeWrap.appendChild(epBtn);
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
        data.results.slice(0, 6).forEach(item => {
          const link = document.createElement("a");
          link.href = `./details.html?id=${item.id}&type=${type}`;
          link.className = "more-like-item abefilm-hover-card";
          const imageSrc = item.poster_path ? `${IMG_URL}${item.poster_path}` : "https://i.imgur.com/YyHsyEr.png";
          link.innerHTML = `<div class="abefilm-image-wrap"><img src="${imageSrc}" alt="${item.title || item.name}" onerror="this.src='https://i.imgur.com/YyHsyEr.png';"><div class="abefilm-hover-overlay"></div><div class="abefilm-play-button"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="var(--keycolor)"></path><path d="M15.4137 13.059L10.6935 15.8458C9.93371 16.2944 9 15.7105 9 14.7868V9.21316C9 8.28947 9.93371 7.70561 10.6935 8.15419L15.4137 10.941C16.1954 11.4026 16.1954 12.5974 15.4137 13.059Z" fill="#FFFFFF"></path></svg></div></div><p>${item.title || item.name}</p>`;
          wrap.appendChild(link);
        });
      } catch (error) {
        wrap.innerHTML = "<p>Failed to load recommendations.</p>";
      }
    }
    
    document.addEventListener("click", async function (e) {
      if (e.target.closest(".poster-play-btn")) {
        const btn = e.target.closest(".poster-play-btn");
        const movieId = btn.getAttribute("data-id");
        const movieType = btn.getAttribute("data-type") || "movie";
        const trailerContainer = document.getElementById("modal-trailer-container");
        const modal = document.getElementById("trailer-modal");
        try {
          const res = await fetch(`${BASE_URL}/${movieType}/${movieId}/videos?api_key=${API_KEY}&language=en-US`);
          const data = await res.json();
          const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
          if (trailer) {
            trailerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" allowfullscreen allow="autoplay; encrypted-media" frameborder="0"></iframe>`;
          } else {
            trailerContainer.innerHTML = "<p>No trailer found.</p>";
          }
          modal.classList.add("active");
        } catch (err) {
          trailerContainer.innerHTML = "<p>Error loading trailer.</p>";
          modal.classList.add("active");
        }
      }
    });

    // Run the setup for the notification once
    setupToastNotification();
    // Start fetching all the data for the page
    fetchData();
  }

  // --- GLOBAL FUNCTIONS AND LISTENERS (They don't depend on API_KEY) ---
  
  let toastTimer;
  function showToastNotification(message, type = 'info') {
      const toast = document.getElementById('custom-toast-notification');
      if (!toast) return;
      clearTimeout(toastTimer);
      toast.textContent = message;
      toast.className = 'toast-show ' + type;
      toastTimer = setTimeout(() => {
          toast.className = toast.className.replace('toast-show', '');
      }, 3000);
  }

  window.goToPlayer = function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const type = params.get('type');
    if (id && type) {
      window.location.href = `/p/player.html?id=${id}&type=${type}`;
    } else {
      showToastNotification("Missing ID or type in URL.", 'info');
    }
  }

  window.bookmarkItem = function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const type = params.get("type") || "movie";
    const title = document.querySelector(".info h1")?.innerText;
    const poster = document.querySelector(".poster img")?.src;
    if (!id || !type || !title) {
      showToastNotification("Cannot add to watchlist: missing info.", 'info');
      return;
    }
    const existingBookmarks = JSON.parse(localStorage.getItem("abefilm_bookmarks") || "[]");
    if (existingBookmarks.some(item => item.id === id && item.type === type)) {
      showToastNotification("Already on your watchlist", 'info');
      return;
    }
    const url = `/p/details.html?id=${id}&type=${type}`;
    existingBookmarks.push({ id, type, title, poster, url });
    localStorage.setItem("abefilm_bookmarks", JSON.stringify(existingBookmarks));
    showToastNotification("Added to Watchlist", 'success');
    if (typeof updateBookmarkCount === 'function') updateBookmarkCount();
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest(".share")) {
      const shareUrl = window.location.href;
      const title = document.querySelector(".info h1")?.innerText || "Check this out!";
      if (navigator.share) {
        navigator.share({ title: title, text: "Watch this online:", url: shareUrl });
      } else {
        navigator.clipboard.writeText(shareUrl).then(() => showToastNotification("Link copied!", 'success'), () => prompt("Copy link:", shareUrl));
      }
    }
    if (e.target.classList.contains("close-btn")) {
      const modal = document.getElementById("trailer-modal");
      if(modal) modal.classList.remove("active");
      const trailerContainer = document.getElementById("modal-trailer-container");
      if(trailerContainer) trailerContainer.innerHTML = "";
    }
  });

  const bookmarkBtn = document.querySelector('.bookmark-btn');
  const bookmarkModal = document.getElementById('bookmark-modal');
  const bookmarkList = document.getElementById('bookmark-list');
  
  if(bookmarkBtn && bookmarkModal && bookmarkList) {
    bookmarkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        bookmarkModal.style.display = bookmarkModal.style.display === 'block' ? 'none' : 'block';
        showBookmarks();
    });
    document.addEventListener('click', (e) => {
        if (bookmarkModal && bookmarkModal.style.display === 'block' && !bookmarkModal.contains(e.target) && !bookmarkBtn.contains(e.target) && !e.target.closest('.delete-bookmark')) {
            bookmarkModal.style.display = 'none';
        }
    });
    bookmarkList.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-bookmark');
        if (btn) {
            const index = parseInt(btn.getAttribute('data-index'));
            const bookmarks = JSON.parse(localStorage.getItem('abefilm_bookmarks') || '[]');
            bookmarks.splice(index, 1);
            localStorage.setItem('abefilm_bookmarks', JSON.stringify(bookmarks));
            showBookmarks();
        }
    });
  }

  window.showBookmarks = function() {
    if (!bookmarkList) return;
    const bookmarks = JSON.parse(localStorage.getItem("abefilm_bookmarks") || "[]");
    bookmarkList.innerHTML = bookmarks.length === 0 ? "<li>Your watchlist is empty.</li>" : bookmarks.map((b, i) => `<li class="bookmark-item"><a href="${b.url}" target="_blank" class="bookmark-link"><img src="${b.poster || 'https://i.imgur.com/YyHsyEr.png'}" alt="${b.title}" class="bookmark-thumb"><span class="bookmark-title">${b.title}</span></a><button class="delete-bookmark" data-index="${i}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.84254 5.48939L8.52333 5.80406L7.84254 5.48939ZM8.81802 4.18112L8.31749 3.62258L8.31749 3.62258L8.81802 4.18112ZM10.2779 3.30696L10.5389 4.01009L10.2779 3.30696ZM13.7221 3.30696L13.9831 2.60384V2.60384L13.7221 3.30696ZM16.1575 5.48939L16.8383 5.17471L16.1575 5.48939ZM8.25 7.03259C8.25 6.61367 8.34194 6.19649 8.52333 5.80406L7.16175 5.17471C6.89085 5.76079 6.75 6.39238 6.75 7.03259H8.25ZM8.52333 5.80406C8.70487 5.41133 8.97357 5.04881 9.31855 4.73966L8.31749 3.62258C7.82675 4.06235 7.43251 4.58893 7.16175 5.17471L8.52333 5.80406ZM9.31855 4.73966C9.66369 4.43037 10.0778 4.18126 10.5389 4.01009L10.0169 2.60384C9.38616 2.83798 8.80808 3.18295 8.31749 3.62258L9.31855 4.73966ZM10.5389 4.01009C11.0001 3.8389 11.4968 3.75 12 3.75V2.25C11.3213 2.25 10.6477 2.36972 10.0169 2.60384L10.5389 4.01009ZM12 3.75C12.5032 3.75 12.9999 3.8389 13.4611 4.01009L13.9831 2.60384C13.3523 2.36972 12.6787 2.25 12 2.25V3.75ZM13.4611 4.01009C13.9222 4.18126 14.3363 4.43037 14.6815 4.73966L15.6825 3.62258C15.1919 3.18295 14.6138 2.83798 13.9831 2.60384L13.4611 4.01009ZM14.6815 4.73966C15.0264 5.04881 15.2951 5.41133 15.4767 5.80406L16.8383 5.17471C16.5675 4.58893 16.1733 4.06235 15.6825 3.62258L14.6815 4.73966ZM15.4767 5.80406C15.6581 6.19649 15.75 6.61367 15.75 7.03259H17.25C17.25 6.39238 17.1092 5.7608 16.8383 5.17471L15.4767 5.80406Z" fill="var(--keycolor)"></path><path d="M3 6.28259C2.58579 6.28259 2.25 6.61838 2.25 7.03259C2.25 7.44681 2.58579 7.78259 3 7.78259V6.28259ZM21 7.78259C21.4142 7.78259 21.75 7.44681 21.75 7.03259C21.75 6.61838 21.4142 6.28259 21 6.28259V7.78259ZM5 7.03259V6.28259H4.25V7.03259H5ZM19 7.03259H19.75V6.28259H19V7.03259ZM18.3418 16.8303L19.0624 17.0383L18.3418 16.8303ZM13.724 20.8553L13.8489 21.5949L13.724 20.8553ZM10.276 20.8553L10.401 20.1158L10.401 20.1158L10.276 20.8553ZM10.1183 20.8287L9.9933 21.5682L9.9933 21.5682L10.1183 20.8287ZM5.65815 16.8303L4.93757 17.0383L5.65815 16.8303ZM13.8817 20.8287L13.7568 20.0892L13.8817 20.8287ZM3 7.78259H21V6.28259H3V7.78259ZM13.7568 20.0892L13.599 20.1158L13.8489 21.5949L14.0067 21.5682L13.7568 20.0892ZM10.401 20.1158L10.2432 20.0892L9.9933 21.5682L10.151 21.5949L10.401 20.1158ZM18.25 7.03259V12.1758H19.75V7.03259H18.25ZM5.75 12.1759V7.03259H4.25V12.1759H5.75ZM18.25 12.1758C18.25 13.6806 18.0383 15.1776 17.6212 16.6223L19.0624 17.0383C19.5185 15.4583 19.75 13.8212 19.75 12.1758H18.25ZM13.599 20.1158C12.5404 20.2947 11.4596 20.2947 10.401 20.1158L10.151 21.5949C11.3751 21.8017 12.6248 21.8017 13.8489 21.5949L13.599 20.1158ZM10.2432 20.0892C8.40523 19.7786 6.90157 18.4335 6.37873 16.6223L4.93757 17.0383C5.61878 19.3981 7.58166 21.1607 9.9933 21.5682L10.2432 20.0892ZM6.37873 16.6223C5.9617 15.1776 5.75 13.6806 5.75 12.1759H4.25C4.25 13.8212 4.48148 15.4583 4.93757 17.0383L6.37873 16.6223ZM14.0067 21.5682C16.4183 21.1607 18.3812 19.3981 19.0624 17.0383L17.6212 16.6223C17.0984 18.4335 15.5947 19.7786 13.7568 20.0892L14.0067 21.5682ZM5 7.78259H19V6.28259H5V7.78259Z" fill="#6c6e76"></path><path d="M10 12V16M14 12V16" stroke="var(--keycolor)" stroke-width="1.5" stroke-linecap="round"></path></g></svg></button></li>`).join('');
    updateBookmarkCount();
  }
  
  window.updateBookmarkCount = function() {
    const countEl = document.getElementById("bookmark-count");
    if (countEl) {
        const count = JSON.parse(localStorage.getItem("abefilm_bookmarks") || "[]").length;
        countEl.textContent = count;
    }
  }

  if(typeof updateBookmarkCount === 'function') updateBookmarkCount();

  // --- WAITING LOGIC ---
  function waitForApiKey() {
    let attempts = 0;
    const maxAttempts = 50;
    const interval = setInterval(() => {
      if (window.apiKey) {
        clearInterval(interval);
        initializeApp(window.apiKey);
      } else if (attempts++ >= maxAttempts) {
        clearInterval(interval);
        const container = document.getElementById("movie-details-container");
        if(container) container.innerHTML = "<p>Error: API configuration is missing.</p>";
      }
    }, 100);
  }

  waitForApiKey();
});
