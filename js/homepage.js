document.addEventListener("DOMContentLoaded", () => {
  
  // This is the main function that contains all of your page logic.
  // It will only be called after the API key is safely available.
  async function initializeApp(apiKey) {
    const endpointEl = document.querySelector("#Text1 .widget-content");
    const loaderLogoEl = document.querySelector("#Text2 .widget-content");
    const loaderLogoUrl = loaderLogoEl?.textContent.trim();
    const rawEndpoint = endpointEl?.textContent.trim();

    if (!rawEndpoint) {
      console.warn("Homepage slider/row endpoint is missing from Text1 widget.");
      return;
    }

    let fetchUrl = "";
    let isAnime = false;

    if (rawEndpoint.toLowerCase() === "anime/trending/day") {
      fetchUrl = `https://api.themoviedb.org/3/trending/tv/day?api_key=${apiKey}&language=en-US`;
      isAnime = true;
    } else {
      fetchUrl = `https://api.themoviedb.org/3/${rawEndpoint}?api_key=${apiKey}&language=en-US`;
    }

    // --- SLIDER LOGIC ---
    const slider = document.getElementById("tmdb-slider");
    const dotContainer = document.getElementById("slider-dots");
    const sliderTitle = document.getElementById("slider-title");

    if (slider && dotContainer && sliderTitle) {
      try {
        const response = await fetch(fetchUrl);
        const data = await response.json();
        let items = data.results || [];

        if (isAnime) {
          items = items.filter(item =>
            item.genre_ids?.includes(16) || item.origin_country?.includes("JP") || item.original_language === "ja"
          );
        }

        items = items.slice(0, 8);
        const titles = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const title = item.title || item.name || "Untitled";
          const image = item.backdrop_path || item.poster_path;
          const mediaType = item.media_type || (rawEndpoint.includes("tv") ? "tv" : "movie");
          if (!image || !mediaType) continue;

          const logoRes = await fetch(`https://api.themoviedb.org/3/${mediaType}/${item.id}/images?api_key=${apiKey}`);
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

          const thumbWrapper = document.createElement("div");
          thumbWrapper.className = "thumb-wrapper";
          const isMobile = window.innerWidth <= 768;
          let thumb;
          if (isMobile) {
            thumb = document.createElement("div");
            thumb.className = "thumbnail-dot";
            thumb.style.backgroundColor = "gray";
          } else {
            thumb = document.createElement("img");
            thumb.className = "thumbnail-dot";
            thumb.src = `https://image.tmdb.org/t/p/w154${image}`;
            thumb.alt = title;
          }
          thumb.setAttribute("data-index", i);
          thumb.onclick = () => showSlide(i);
          thumbWrapper.appendChild(thumb);
          dotContainer.appendChild(thumbWrapper);
        }

        const slides = document.querySelectorAll(".slide");
        const dots = document.querySelectorAll(".thumbnail-dot");
        let index = 0;
        let sliderInterval = null;

        function showSlide(i) {
          index = i;
          slides.forEach((s, j) => s.style.display = j === i ? "block" : "none");
          dots.forEach((d, j) => d.classList.toggle("active", j === i));
          sliderTitle.textContent = titles[i] || '';
          // Reset interval on manual change
          if(sliderInterval) clearInterval(sliderInterval);
          sliderInterval = setInterval(() => changeSlide(1), 4000);
        }

        window.changeSlide = (dir) => {
          index = (index + dir + slides.length) % slides.length;
          showSlide(index);
        }

        if(slides.length > 0) showSlide(0);

      } catch (err) {
        console.error("Failed to load slider content:", err);
      }
    }

    // --- CONTENT ROW LOGIC ---
    document.querySelectorAll(".widget-content").forEach((contentEl) => {
      const parentWidget = contentEl.closest(".widget");
      if (!parentWidget || ["HTML01", "Text1", "Text2"].includes(parentWidget.id)) return;
      
      const endpointPath = contentEl.textContent.trim();
      if (!endpointPath || endpointPath.includes(" ") || endpointPath.startsWith("http")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "tmdb-wrapper";
      const displayEl = document.createElement("div");
      displayEl.className = "tmdb-row";
      displayEl.innerHTML = [...Array(7)].map(() => `<div class="tmdb-card shimmer-card"><div class="tmdb-thumb shimmer"><img src="${loaderLogoUrl}" class="tmdb-logo" alt="Logo" /></div><div class="tmdb-title shimmer"></div></div>`).join("");
      wrapper.appendChild(displayEl);
      contentEl.insertAdjacentElement("afterend", wrapper);
      
      const observer = new IntersectionObserver(async (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          obs.unobserve(entry.target);
          try {
            let endpointPathClean = endpointPath;
            let queryString = "";
            if (endpointPath.includes("?")) {
              const parts = endpointPath.split("?");
              endpointPathClean = parts[0];
              queryString = "&" + parts[1];
            }
            const url = `https://api.themoviedb.org/3/${endpointPathClean}?api_key=${apiKey}${queryString}`;
            const res = await fetch(url);
            const data = await res.json();
            const results = data.results || [];

            if (results.length === 0) {
              displayEl.innerHTML = "<p>No results from TMDb.</p>";
              return;
            }
            setTimeout(() => {
              displayEl.innerHTML = results.slice(0, 14).map(item => {
                const title = item.title || item.name || "Untitled";
                const image = item.poster_path;
                const year = (item.release_date || item.first_air_date || "").split("-")[0] || "N/A";
                const rating = item.vote_average?.toFixed(1) || "N/A";
                const mediaType = item.media_type || (endpointPath.includes("tv") ? "tv" : "movie");
                const dynamicLink = `${window.location.origin}/p/details.html?id=${item.id}&type=${mediaType}`;
                return `<a class="tmdb-card" title="${title}" href="${dynamicLink}"><div class="tmdb-thumb"><img src="https://image.tmdb.org/t/p/w300${image}" alt="${title}" loading="lazy" /><div class="hover-overlay"></div><span class="tmdb-meta tmdb-year">${year}</span><span class="tmdb-meta tmdb-rating"><i class="bi bi-star"></i> ${rating}</span><div class="play-btn"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="var(--keycolor)"/><path d="M15.4137 13.059L10.6935 15.8458C9.93371 16.2944 9 15.7105 9 14.7868V9.21316C9 8.28947 9.93371 7.70561 10.6935 8.15419L15.4137 10.941C16.1954 11.4026 16.1954 12.5974 15.4137 13.059Z" fill="#FFFFFF"/></svg></div></div><div class="tmdb-title">${title}</div></a>`;
              }).join("");
              // After content is loaded, add scroll buttons
              const leftBtn = document.createElement("button");
              leftBtn.className = "tmdb-scroll left"; leftBtn.innerHTML = "&#8249;";
              const rightBtn = document.createElement("button");
              rightBtn.className = "tmdb-scroll right"; rightBtn.innerHTML = "&#8250;";
              wrapper.prepend(leftBtn);
              wrapper.append(rightBtn);
              const scrollStep = () => displayEl.querySelector(".tmdb-card")?.offsetWidth + 10 || 300;
              leftBtn.onclick = () => displayEl.scrollBy({ left: -scrollStep() * 2, behavior: "smooth" });
              rightBtn.onclick = () => displayEl.scrollBy({ left: scrollStep() * 2, behavior: "smooth" });
            }, 800);
          } catch (err) {
            displayEl.innerHTML = "<p style='color:red;'>Failed to load TMDb data.</p>";
            console.error(err);
          }
        }
      }, { threshold: 0.1, rootMargin: '150px 0px' });
      observer.observe(wrapper);
    });
  }

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
        console.error("API Key (window.apiKey) not found. Homepage content will not load.");
      }
    }, 100);
  }

  // Start the entire process
  waitForApiKey();

});
