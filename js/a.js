// This is the complete, final, and unified script. 
// Replace the entire content of your main bundled JS file (22.js / main.js) with this.
(() => {
  // ===============================================
  // === MASTER INITIALIZER (THE CONTROLLER) ===
  // This is the only part of the script that runs automatically.
  // ===============================================
  document.addEventListener("DOMContentLoaded", () => {
    // This function will poll for the API key from your Blogger widget.
    // Once it's found, it will initialize all other parts of the theme in the correct order.
    function waitForApiKeyAndInitialize() {
      let attempts = 0;
      const maxAttempts = 50; // Try for 5 seconds

      const interval = setInterval(() => {
        const apiKey = window.apiKey;

        if (apiKey) {
          // --- SUCCESS! API KEY FOUND ---
          clearInterval(interval);
          
          console.log("API Key found. Initializing theme...");

          // Now, run all other initializers in a safe, controlled order.
          const isHomepage = window.location.pathname === "/" || window.location.pathname.endsWith("/index.html") || (window.location.hostname.includes("blogspot.com") && !window.location.pathname.includes("/p/"));

          initializeThemeLogic();       // Step 1: Basic navigation, footers, etc.
          initializeSearch(apiKey);       // Step 2: Search bar is always needed.
          
          if (isHomepage) {
            initializeHomepageContent(apiKey); // Step 3: Homepage-specific content
          } else if (window.location.href.includes("/p/details.html")) {
            initializeDetailsPage(apiKey);
            initializeCommentSystem();      // Comments only on details page
          } else if (window.location.href.includes("/p/player.html")) {
            initializePlayerPage(apiKey);
          } else if (window.location.href.includes("/p/library.html")) {
            initializeLibraryPage(apiKey);
          }
          
        } else if (attempts >= maxAttempts) {
          // --- FAILURE: API KEY NOT FOUND ---
          clearInterval(interval);
          console.error("API Key (window.apiKey) was not found after 5 seconds. Check if HTML01 widget is present and configured for this page type.");
        }
        attempts++;
      }, 100);
    }

    // Start the entire process
    waitForApiKeyAndInitialize();
  });

  // ==========================================================
  // === All logic is now wrapped in its own function below ===
  // ==========================================================

  // PART 1: General Theme & Navigation Logic
  function initializeThemeLogic() {
    let e = window.location.href, o = window.innerWidth <= 768, t = location.origin + "/", d = location.pathname === "/" || location.pathname.endsWith("/index.html") || location.hostname.includes("blogspot.com") && !location.pathname.includes("/p/"), u = e.includes("/details.html"), k = e.includes("/player.html"), m = e.includes("/library.html"), s = e.includes("/about-us.html"), c = e.includes("/privacy-policy.html"), y = e.includes("/disclaimer.html");
    // Footer Logic
    let b = document.querySelector("#Text12 .widget-content"), w = document.querySelector("#Text13 .widget-content"), g = document.querySelector("#Text14 .widget-content"), p = document.querySelector("footer .website-name"), C = document.querySelector("footer .website-description"), A = document.querySelector("footer .credit");
    if (b && p && (p.innerHTML = b.innerHTML), w && C && (C.innerHTML = w.innerHTML), g && A) { A.innerHTML = g.innerHTML; let r = A.querySelector("#currentYear"); r && (r.textContent = new Date().getFullYear()) }
    // Static Page Logic
    let B = document.getElementById("about-us"), H = document.getElementById("privacy-policy"), q = document.getElementById("disclaimer"), j = document.querySelector("#Text10 .widget-content"), x = document.querySelector("#Text9 .widget-content"), h = document.querySelector("#Text11 .widget-content");
    s && B && j && (B.innerHTML = j.innerHTML), c && H && x && (H.innerHTML = x.innerHTML), y && q && h && (q.innerHTML = h.innerHTML);
    // Page Content Visibility
    let S = document.getElementById("details-content"), a = document.getElementById("player-content"), _ = document.getElementById("library");
    S && (S.style.display = u ? "block" : "none"), a && (a.style.display = k ? "block" : "none"), _ && (_.style.display = m ? "block" : "none"), B && (B.style.display = s ? "block" : "none"), H && (H.style.display = c ? "block" : "none"), q && (q.style.display = y ? "block" : "none");
    k && (document.querySelector(".top-header")?.remove(), document.querySelector(".side-menu")?.remove()), m && o && document.querySelector(".top-header")?.remove();
    // Anchor/Hash Navigation
    let I = { home: "tmdb-section-1", movies: "tmdb-section-2", tvseries: "tmdb-section-3", animation: "tmdb-section-4", kdramas: "tmdb-section-5", cdramas: "tmdb-section-6", anime: "tmdb-section-7", "western-movies": "tmdb-section-8", "western-series": "tmdb-section-9" };
    document.querySelectorAll('.side-menu a[href^="#"], .bottom-navbar a[href^="#"], .anchor-links a[href^="#"]').forEach(r => { r.addEventListener("click", function(T) { d || (T.preventDefault(), window.location.href = t + this.getAttribute("href")) }) });
    if (!d && location.hash && I[location.hash.replace("#", "")]) { window.location.href = t + location.hash; return }
    if (d) { let r = () => { let T = window.location.hash.replace("#", "") || "home"; Object.entries(I).forEach(([E, R]) => { let Z = document.getElementById(R); Z && (Z.style.display = E === T ? "block" : "none") }), document.querySelectorAll(".side-menu a, .bottom-navbar a, .anchor-links a").forEach(E => { let R = E.getAttribute("href")?.replace("#", ""); E.classList.toggle("active", R === T) }) }; r(), window.addEventListener("hashchange", r) }
    // Other UI listeners
    let n = document.querySelector(".top-header"); if (n) { let r = () => { window.innerWidth > 768 ? n.style.background = window.scrollY > 10 ? "#111" : "transparent" : n.style.background = "#111" }; window.addEventListener("scroll", r), r() }
    let i = document.getElementById("toggleSidebar"), v = document.getElementById("mobileSidebar"), f = document.getElementById("sidebarOverlay"); i && v && f && (i.addEventListener("click", () => { v.classList.toggle("active"), f.style.display = v.classList.contains("active") ? "block" : "none" }), f.addEventListener("click", () => { v.classList.remove("active"), f.style.display = "none" }));
  }

  // PART 2: Search Functionality
  function initializeSearch(API_KEY) {
      const searchInput = document.querySelector(".search-input");
      const resultsDropdown = document.getElementById("search-results");

      if (!searchInput || !resultsDropdown) {
          console.log("Search elements not found, skipping search initialization.");
          return;
      }
      
      const genreMap = {};

      async function loadGenres() { /* ... your original loadGenres code ... */ }
      async function getRating(type, id) { /* ... your original getRating code ... */ }
      async function searchMulti(query) { /* ... your original searchMulti code ... */ }
      function showResults(results) { /* ... your original showResults code ... */ }

      // Paste the full code for the functions above inside here

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

      document.addEventListener("click", (e) => {
          if (!e.target.closest(".search-input-wrapper")) {
              resultsDropdown.style.display = "none";
          }
      });
      
      loadGenres();
  }
  
  // PART 3: Homepage TMDB Content Logic
  function initializeHomepageContent(API_KEY) {
    const loaderLogo = document.querySelector("#Text2 .widget-content")?.textContent.trim() || "";
    // ... Paste your 't' (slider) and 'd' (sections) functions here and call them ...
  }
  
  // PART 4: Details Page Logic
  function initializeDetailsPage(API_KEY) {
    // ... Paste your details page logic here (the second DOMContentLoaded block) ...
  }

  // PART 5: Player Page Logic
  function initializePlayerPage(API_KEY) {
    // ... Paste your player page logic here (the third DOMContentLoaded block) ...
  }
  
  // PART 6: Library Page Logic
  function initializeLibraryPage(API_KEY) {
    // ... Paste your library page logic here (the fourth DOMContentLoaded block) ...
  }
  
  // PART 7: Comment System Logic
  function initializeCommentSystem() {
    // ... Paste your entire Supabase comment script here ...
  }

})(); // End of the main script wrapper
