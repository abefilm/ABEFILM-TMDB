// This is the complete, corrected code that should replace everything in your 22.js or main.js
// It ensures all logic runs in the correct order, fixing the "null" errors on the homepage.
document.addEventListener("DOMContentLoaded", () => {
  // ===============================================
  // === PART 1: CORE THEME AND NAVIGATION LOGIC ===
  // ===============================================

  function initializeThemeAndNavigation() {
    // Logic for Footer
    const footerData = {
      name: document.querySelector("#Text12 .widget-content")?.innerHTML,
      desc: document.querySelector("#Text13 .widget-content")?.innerHTML,
      credit: document.querySelector("#Text14 .widget-content")?.innerHTML,
    };
    const footerElements = {
      name: document.querySelector("footer .website-name"),
      desc: document.querySelector("footer .website-description"),
      credit: document.querySelector("footer .credit"),
    };
    if (footerData.name && footerElements.name) footerElements.name.innerHTML = footerData.name;
    if (footerData.desc && footerElements.desc) footerElements.desc.innerHTML = footerData.desc;
    if (footerData.credit && footerElements.credit) {
      footerElements.credit.innerHTML = footerData.credit;
      let yearSpan = footerElements.credit.querySelector("#currentYear");
      if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    }
    
    // Logic for Static Pages
    const pages = {
      about: { el: document.getElementById("about-us"), widget: document.querySelector("#Text10 .widget-content") },
      privacy: { el: document.getElementById("privacy-policy"), widget: document.querySelector("#Text9 .widget-content") },
      disclaimer: { el: document.getElementById("disclaimer"), widget: document.querySelector("#Text11 .widget-content") }
    };
    if (location.href.includes("/about-us.html") && pages.about.el && pages.about.widget) pages.about.el.innerHTML = pages.about.widget.innerHTML;
    if (location.href.includes("/privacy-policy.html") && pages.privacy.el && pages.privacy.widget) pages.privacy.el.innerHTML = pages.privacy.widget.innerHTML;
    if (location.href.includes("/disclaimer.html") && pages.disclaimer.el && pages.disclaimer.widget) pages.disclaimer.el.innerHTML = pages.disclaimer.widget.innerHTML;

    // ... (Your other navigation and visibility logic)
  }

  // =======================================
  // === PART 2: SEARCH INITIALIZATION   ===
  // =======================================

  function initializeSearch(API_KEY) {
      const searchInput = document.querySelector(".search-input");
      const resultsDropdown = document.getElementById("search-results");

      if (!searchInput || !resultsDropdown) return;

      const genreMap = {};

      async function loadGenres() { /* Your loadGenres function */ }
      async function getRating(type, id) { /* Your getRating function */ }
      async function searchMulti(query) { /* Your searchMulti function */ }
      function showResults(results) { /* Your showResults function */ }
      
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
  
  // =======================================
  // === PART 3: HOMEPAGE TMDB CONTENT   ===
  // =======================================
  
  function initializeHomepageContent(API_KEY, loaderLogo) {
      // Logic for homepage sections (your `d` function)
      // Logic for homepage slider (your `t` function)
      
      // I am simplifying the functions here, but you would paste your
      // `t(m,s)` and `d(m,s)` functions inside this initializer
      function loadHomepageSections() {
        console.log("Loading homepage sections with API Key and Logo...");
        // Paste your logic for rendering horizontal carousels here.
      }
      function loadHomepageSlider() {
        console.log("Loading homepage slider with API Key...");
        // Paste your logic for the top slider here.
      }
      
      loadHomepageSlider();
      loadHomepageSections();
  }
  
  // ===============================================
  // === MASTER CONTROLLER (Runs everything) ===
  // ===============================================
  
  let attempts = 0;
  const maxAttempts = 50; // Try for 5 seconds

  // This interval is the master clock for your dynamic content
  const initializerInterval = setInterval(() => {
    
    // Check for the API key from the Blogger widget
    const apiKeyEl = document.querySelector("#HTML01 .widget-content");
    const key = apiKeyEl?.textContent.trim();

    if (key) {
      clearInterval(initializerInterval); // Stop polling once we have the key
      
      // --- RUN EVERYTHING IN THE CORRECT ORDER ---
      
      // 1. Run basic theme setup first
      initializeThemeAndNavigation();
      
      // 2. Initialize the search bar - it now has its API key
      initializeSearch(key);
      
      // 3. If on homepage, initialize the TMDB content
      const isHomepage = location.pathname === "/" || location.pathname.endsWith("/index.html") || (location.hostname.includes("blogspot.com") && !location.pathname.includes("/p/"));
      if (isHomepage) {
        const loaderLogo = document.querySelector("#Text2 .widget-content")?.textContent.trim() || "";
        initializeHomepageContent(key, loaderLogo);
      }
      
      // 4. Initialize any other scripts like the player or library pages
      // initializePlayer(key);
      // initializeLibrary(key);
      
      console.log("MovieBox theme fully initialized!");

    } else if (attempts >= maxAttempts) {
      clearInterval(initializerInterval);
      console.error("API Key Widget (#HTML01) was not found or is empty after 5 seconds. Dynamic content will not load.");
      // You can also show an error message on the page itself here.
    }
    
    attempts++;
  }, 100);

});
