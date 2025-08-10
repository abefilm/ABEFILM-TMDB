// All scripts are wrapped in one DOMContentLoaded listener for efficiency
document.addEventListener('DOMContentLoaded', function () {

  // ---= 1. SHARED VARIABLES & PAGE DETECTION =---
  // Define common variables once for use in all subsequent sections
  const path = window.location.href;
  const isMobile = window.innerWidth <= 768;
  const homeURL = location.origin + "/";

  // Page-specific flags
  const isHomepage = location.pathname === "/" ||
                     location.pathname.endsWith("/index.html") ||
                     (location.hostname.includes("blogspot.com") && !location.pathname.includes("/p/"));
  const isDetailsPage = path.includes('/details.html');
  const isPlayerPage = path.includes('/player.html');
  const isLibraryPage = path.includes('/library.html');
  const isAboutPage = path.includes('/about-us.html');
  const isPrivacyPage = path.includes('/privacy-policy.html');
  const isDisclaimerPage = path.includes('/disclaimer.html');


  // ---= 2. DYNAMIC CONTENT INJECTION (from Widgets) =---

  // Inject Footer Content from Text Widgets
  const text12 = document.querySelector('#Text12 .widget-content');
  const text13 = document.querySelector('#Text13 .widget-content');
  const text14 = document.querySelector('#Text14 .widget-content');
  const name = document.querySelector('footer .website-name');
  const desc = document.querySelector('footer .website-description');
  const credit = document.querySelector('footer .credit');

  if (text12 && name) { name.innerHTML = text12.innerHTML; }
  if (text13 && desc) { desc.innerHTML = text13.innerHTML; }
  if (text14 && credit) {
    credit.innerHTML = text14.innerHTML;
    const yearSpan = credit.querySelector('#currentYear');
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }
  }

  // Inject Static Page Content from Text Widgets
  const aboutUsContainer = document.getElementById("about-us");
  const privacyPolicyContainer = document.getElementById("privacy-policy");
  const disclaimerContainer = document.getElementById("disclaimer");
  const aboutWidget = document.querySelector("#Text10 .widget-content");
  const privacyWidget = document.querySelector("#Text9 .widget-content");
  const disclaimerWidget = document.querySelector("#Text11 .widget-content");

  if (isAboutPage && aboutUsContainer && aboutWidget) { aboutUsContainer.innerHTML = aboutWidget.innerHTML; }
  if (isPrivacyPage && privacyPolicyContainer && privacyWidget) { privacyPolicyContainer.innerHTML = privacyWidget.innerHTML; }
  if (isDisclaimerPage && disclaimerContainer && disclaimerWidget) { disclaimerContainer.innerHTML = disclaimerWidget.innerHTML; }


  // ---= 3. PAGE-SPECIFIC LAYOUT & VISIBILITY =---

  // Show/Hide main content blocks based on the current page URL
  const detailsContent = document.getElementById('details-content');
  const playerContent = document.getElementById('player-content');
  const libraryContent = document.getElementById('library');

  if (detailsContent) detailsContent.style.display = isDetailsPage ? 'block' : 'none';
  if (playerContent) playerContent.style.display = isPlayerPage ? 'block' : 'none';
  if (libraryContent) libraryContent.style.display = isLibraryPage ? 'block' : 'none';
  if (aboutUsContainer) aboutUsContainer.style.display = isAboutPage ? 'block' : 'none';
  if (privacyPolicyContainer) privacyPolicyContainer.style.display = isPrivacyPage ? 'block' : 'none';
  if (disclaimerContainer) disclaimerContainer.style.display = isDisclaimerPage ? 'block' : 'none';

  // Remove header/sidebar on specific pages/devices for a cleaner view
  if (isPlayerPage) {
    document.querySelector('.top-header')?.remove();
    document.querySelector('.side-menu')?.remove();
  }
  if (isLibraryPage && isMobile) {
    document.querySelector('.top-header')?.remove();
  }


  // ---= 4. HOMEPAGE HASH-BASED NAVIGATION =---

  const hashToSection = {
    home: 'tmdb-section-1',
    movies: 'tmdb-section-2',
    tvseries: 'tmdb-section-3',
    animation: 'tmdb-section-4',
    kdramas: 'tmdb-section-5',
    cdramas: 'tmdb-section-6',
    anime: 'tmdb-section-7',
    'western-movies': 'tmdb-section-8',
    'western-series': 'tmdb-section-9'
  };

  // Redirect to homepage if a hash link is clicked on a non-homepage
  document.querySelectorAll('.side-menu a[href^="#"], .bottom-navbar a[href^="#"], .anchor-links a[href^="#"]').forEach(link => {
    link.addEventListener("click", function (e) {
      if (!isHomepage) {
        e.preventDefault();
        window.location.href = homeURL + this.getAttribute("href");
      }
    });
  });

  // Redirect if a non-homepage is loaded directly with a hash
  if (!isHomepage && location.hash && hashToSection[location.hash.replace('#','')]) {
    window.location.href = homeURL + location.hash;
    return; // Stop further script execution on this page
  }
  
  // If on the homepage, manage section visibility based on hash
  if (isHomepage) {
    const updateSectionsFromHash = () => {
      const currentHash = window.location.hash.replace('#', '') || 'home';

      Object.entries(hashToSection).forEach(([key, sectionId]) => {
        const section = document.getElementById(sectionId);
        if (section) {
          section.style.display = (key === currentHash) ? 'block' : 'none';
        }
      });

      // Highlight active link in all menus
      document.querySelectorAll('.side-menu a, .bottom-navbar a, .anchor-links a').forEach(link => {
        const linkHash = link.getAttribute('href')?.replace('#', '');
        link.classList.toggle('active', linkHash === currentHash);
      });
    };
    
    updateSectionsFromHash(); // Run on initial load
    window.addEventListener('hashchange', updateSectionsFromHash); // Run when hash changes
  }


  // ---= 5. UI INTERACTIONS & EVENT LISTENERS =---

  // Helper function for custom toast notifications
  let toastTimer;
  function showToastNotification(message, type = 'info') {
    let toast = document.getElementById('custom-toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'custom-toast-notification';
        document.body.appendChild(toast);
    }
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.className = 'toast-show ' + type;
    toastTimer = setTimeout(() => {
        toast.className = toast.className.replace('toast-show', '');
    }, 3000);
  }

  // Sticky Header on Scroll
  const topHeader = document.querySelector(".top-header");
  if (topHeader) {
    const handleScroll = () => {
      if (window.innerWidth > 768) {
        topHeader.style.background = (window.scrollY > 10) ? "#111" : "transparent";
      } else {
        topHeader.style.background = "#111"; // Always solid on mobile
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
  }

  // Mobile Sidebar Toggle
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("mobileSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (toggleBtn && sidebar && overlay) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      overlay.style.display = sidebar.classList.contains("active") ? "block" : "none";
    });
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("active");
      overlay.style.display = "none";
    });
  }

  // General Action Buttons: Share, Top, Back
  document.querySelector('.share-btn')?.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: document.title, url: window.location.href })
        .catch(err => console.warn('Share failed:', err));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => showToastNotification('Link copied to clipboard!', 'success'))
        .catch(() => showToastNotification('Could not copy link.', 'error'));
    }
  });

  document.querySelector('.top-btn')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  document.querySelector('.back-history')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/'; // Fallback
    }
  });

  // Scroll to Comment Section Button
  const commentButton = document.getElementById('comment-nav-button');
  const commentSection = document.getElementById('comment-section');
  if (commentButton && commentSection) {
    commentButton.addEventListener('click', (e) => {
      e.preventDefault();
      commentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

}); // End of DOMContentLoaded


// --- GLOBAL CLICK LISTENER FOR DELEGATED EVENTS ---
document.addEventListener("click", function (e) {
  // Cast Scroller Buttons
  if (e.target.classList.contains("cast-scroll-btn")) {
    const scrollContainer = e.target.closest(".cast-scroll-wrapper")?.querySelector(".cast-scroll");
    if (scrollContainer) {
      const direction = e.target.classList.contains("left") ? -1 : 1;
      const card = scrollContainer.querySelector('.cast-card');
      const scrollAmount = (card ? card.offsetWidth * 2.5 : 200);
      scrollContainer.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
    }
  }
});
