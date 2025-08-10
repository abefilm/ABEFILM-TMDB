document.addEventListener("DOMContentLoaded", () => {
  /**
   * Builds a valid TMDB API URL, correctly handling endpoints with existing query parameters.
   * @param {string} endpoint - The raw endpoint path (e.g., "movie/popular" or "discover/movie?with_genres=28").
   * @param {string} apiKey - Your TMDB API key.
   * @returns {string} The full, valid URL for the API request.
   */
  function buildApiUrl(endpoint, apiKey) {
    const baseUrl = "https://api.themoviedb.org/3/";
    const url = new URL(baseUrl + endpoint);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("language", "en-US"); // You can change the default language here
    return url.toString();
  }

  /**
   * Reliably determines the media type ('movie' or 'tv').
   * It prioritizes the 'media_type' field from the API item.
   * As a fallback, it intelligently infers the type from the endpoint path.
   * @param {object} item - The movie/tv item from the API response.
   * @param {string} endpointPath - The endpoint path used for the fetch.
   * @returns {string} 'movie' or 'tv'.
   */
  function getMediaType(item, endpointPath) {
    if (item.media_type && (item.media_type === 'movie' || item.media_type === 'tv')) {
      return item.media_type;
    }
    // Infer from endpoint for routes like /movie/popular or /discover/tv
    if (endpointPath.startsWith("tv/") || endpointPath.startsWith("discover/tv") || endpointPath.startsWith("trending/tv")) {
      return "tv";
    }
    return "movie";
  }

  /**
   * Initializes and populates the main content slider.
   * @param {string} rawEndpoint - The endpoint from the Blogger widget.
   * @param {string} apiKey - Your TMDB API key.
   */
  async function initSlider(rawEndpoint, apiKey) {
    const slider = document.getElementById("tmdb-slider");
    const dotContainer = document.getElementById("slider-dots");
    const sliderTitleEl = document.getElementById("slider-title");

    if (!slider || !dotContainer || !sliderTitleEl) return;

    try {
      const fetchUrl = buildApiUrl(rawEndpoint, apiKey);
      const response = await fetch(fetchUrl);
      const data = await response.json();
      const items = (data.results || []).slice(0, 8); // Limit to 8 slides
      const titles = [];

      if (items.length === 0) {
        slider.innerHTML = "<p>No slider content found for this endpoint.</p>";
        return;
      }
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const mediaType = getMediaType(item, rawEndpoint);
        const title = item.title || item.name || "Untitled";
        const image = item.backdrop_path || item.poster_path;

        if (!image) continue;

        const logoRes = await fetch(buildApiUrl(`${mediaType}/${item.id}/images`, apiKey));
        const logoData = await logoRes.json();
        const logo = logoData.logos?.find(l => l.iso_639_1 === "en") || logoData.logos?.[0];
        const logoUrl = logo ? `https://image.tmdb.org/t/p/w300${logo.file_path}` : "";

        const dynamicLink = `${window.location.origin}/p/details.html?id=${item.id}&type=${mediaType}`;
        const slide = document.createElement("a");
        slide.className = "slide";
        slide.href = dynamicLink;
        slide.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${image})`;
        slide.innerHTML = `<div class="slide-caption">${logoUrl ? `<img class="logo-title" src="${logoUrl}" alt="${title} Logo" />` : `<h2>${title}</h2>`}</div>`;
        slider.appendChild(slide);

        titles.push(title);

        const thumb = document.createElement("div");
        thumb.className = "thumbnail-dot";
        thumb.setAttribute("data-index", i);
        thumb.onclick = () => showSlide(i);
        dotContainer.appendChild(thumb);
      }

      const slides = document.querySelectorAll("#tmdb-slider .slide");
      const dots = document.querySelectorAll("#slider-dots .thumbnail-dot");
      let index = 0;
      let sliderInterval;

      function showSlide(i) {
        index = i;
        slides.forEach((s, j) => s.style.display = j === i ? "block" : "none");
        dots.forEach((d, j) => d.classList.toggle("active", j === i));
        sliderTitleEl.textContent = titles[i] || '';
        if (sliderInterval) clearInterval(sliderInterval);
        sliderInterval = setInterval(() => changeSlide(1), 5000);
      }

      window.changeSlide = (dir) => {
        index = (index + dir + slides.length) % slides.length;
        showSlide(index);
      };

      if (slides.length > 0) showSlide(0);

    } catch (err) {
      console.error("Failed to load slider content:", err);
      slider.innerHTML = "<p style='color:red;'>Error loading slider.</p>";
    }
  }

  /**
   * Initializes all content rows found in the widgets.
   * @param {string} apiKey - Your TMDB API key.
   * @param {string} loaderLogoUrl - URL for the shimmer effect logo.
   */
  function initContentRows(apiKey, loaderLogoUrl) {
    document.querySelectorAll(".widget-content").forEach((contentEl) => {
      const parentWidget = contentEl.closest(".widget");
      // Exclude specific widgets used for configuration
      if (!parentWidget || ["HTML01", "Text1", "Text2"].includes(parentWidget.id)) return;
      
      const endpointPath = contentEl.textContent.trim();
      // Ensure the widget content looks like a valid endpoint path
      if (!endpointPath || endpointPath.includes(" ") || endpointPath.startsWith("http")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "tmdb-wrapper";
      const displayEl = document.createElement("div");
      displayEl.className = "tmdb-row";
      // Create shimmer placeholders
      displayEl.innerHTML = [...Array(7)].map(() => 
        `<div class="tmdb-card shimmer-card">
           <div class="tmdb-thumb shimmer"><img src="${loaderLogoUrl}" class="tmdb-logo" alt="Logo" /></div>
           <div class="tmdb-title shimmer"></div>
         </div>`
      ).join("");
      wrapper.appendChild(displayEl);
      contentEl.insertAdjacentElement("afterend", wrapper);
      
      const observer = new IntersectionObserver(async (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          obs.unobserve(entry.target); // Load only once
          try {
            const fetchUrl = buildApiUrl(endpointPath, apiKey);
            const res = await fetch(fetchUrl);
            const data = await res.json();
            const results = data.results || [];

            if (results.length === 0) {
              displayEl.innerHTML = "<p>No results found for this category.</p>";
              return;
            }

            // A short delay to allow the shimmer effect to be seen
            setTimeout(() => {
              displayEl.innerHTML = results.slice(0, 14).map(item => {
                const mediaType = getMediaType(item, endpointPath);
                const title = item.title || item.name || "Untitled";
                const image = item.poster_path;
                if (!image) return ''; // Skip items without a poster

                const year = (item.release_date || item.first_air_date || "").split("-")[0] || "N/A";
                const rating = item.vote_average?.toFixed(1) || "N/A";
                const dynamicLink = `${window.location.origin}/p/details.html?id=${item.id}&type=${mediaType}`;
                
                return `
                  <a class="tmdb-card" title="${title}" href="${dynamicLink}">
                    <div class="tmdb-thumb">
                      <img src="https://image.tmdb.org/t/p/w300${image}" alt="${title}" loading="lazy" />
                      <div class="hover-overlay"></div>
                      <span class="tmdb-meta tmdb-year">${year}</span>
                      <span class="tmdb-meta tmdb-rating"><i class="bi bi-star"></i> ${rating}</span>
                      <div class="play-btn"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="var(--keycolor)"/><path d="M15.4137 13.059L10.6935 15.8458C9.93371 16.2944 9 15.7105 9 14.7868V9.21316C9 8.28947 9.93371 7.70561 10.6935 8.15419L15.4137 10.941C16.1954 11.4026 16.1954 12.5974 15.4137 13.059Z" fill="#FFFFFF"/></svg></div>
                    </div>
                    <div class="tmdb-title">${title}</div>
                  </a>`;
              }).join("");

              // Add scroll buttons only if content was loaded
              if (displayEl.innerHTML.trim() !== "") {
                  const leftBtn = document.createElement("button");
                  leftBtn.className = "tmdb-scroll left"; leftBtn.innerHTML = "&#8249;";
                  const rightBtn = document.createElement("button");
                  rightBtn.className = "tmdb-scroll right"; rightBtn.innerHTML = "&#8250;";
                  wrapper.prepend(leftBtn);
                  wrapper.append(rightBtn);
                  const scrollStep = () => displayEl.querySelector(".tmdb-card")?.offsetWidth + 10 || 300;
                  leftBtn.onclick = () => displayEl.scrollBy({ left: -scrollStep() * 2, behavior: "smooth" });
                  rightBtn.onclick = () => displayEl.scrollBy({ left: scrollStep() * 2, behavior: "smooth" });
              }
            }, 500);
          } catch (err) {
            displayEl.innerHTML = "<p style='color:red;'>Failed to load TMDb data.</p>";
            console.error(err);
          }
        }
      }, { threshold: 0.1, rootMargin: '150px 0px' });
      observer.observe(wrapper);
    });
  }

  /**
   * Main app entry point. This function is called once the API key is available.
   * @param {string} apiKey - Your TMDB API key.
   */
  function initializeApp(apiKey) {
    // --- Get Configuration from Widgets ---
    const endpointEl = document.querySelector("#Text1 .widget-content");
    const loaderLogoEl = document.querySelector("#Text2 .widget-content");
    const loaderLogoUrl = loaderLogoEl?.textContent.trim() || ""; // Default to empty string if not found
    const sliderEndpoint = endpointEl?.textContent.trim();

    // --- Initialize Slider ---
    if (sliderEndpoint) {
      initSlider(sliderEndpoint, apiKey);
    } else {
      console.warn("Slider endpoint is missing from Text1 widget. Slider will not load.");
    }

    // --- Initialize All Content Rows ---
    initContentRows(apiKey, loaderLogoUrl);
  }

  /**
   * Waits for the global `window.apiKey` to be set by another script,
   * then kicks off the application.
   */
  function waitForApiKey() {
    let attempts = 0;
    const maxAttempts = 50; // Try for 5 seconds
    const interval = setInterval(() => {
      if (window.apiKey) {
        clearInterval(interval);
        initializeApp(window.apiKey);
      } else if (attempts++ >= maxAttempts) {
        clearInterval(interval);
        console.error("API Key (window.apiKey) was not found. Homepage content will not load.");
      }
    }, 100);
  }

  // Start the entire process
  waitForApiKey();
});
