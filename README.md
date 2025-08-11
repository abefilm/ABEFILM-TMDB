# MOVIEBOX - Blogger Movie & TV Template Powered by TMDB API
<img src="https://i.imgur.com/4Ef1E6x.png" alt="Desktop 1" width="100%"/>

---

## Introduction
Welcome to ABEFILM, a dynamic movie and TV series website built on the Blogger platform, powered by The Movie Database (TMDB) API. This project enables users to browse, search, and explore movies, TV series, anime, and animations with real-time data fetched directly from TMDB.

---


### Desktop View

<table>
  <tr>
    <td><img src="https://i.imgur.com/emvLhKu.png" alt="Desktop 1" width="250"/></td>
    <td><img src="https://i.imgur.com/HpaYdCl.png" alt="Desktop 2" width="250"/></td>
    <td><img src="https://i.imgur.com/aAbk3u8.png" alt="Desktop 3" width="250"/></td>
  </tr>
  <tr>
    <td><img src="https://i.imgur.com/UEIKnDD.png" alt="Desktop 4" width="250"/></td>
    <td><img src="https://i.imgur.com/PCPAawp.png" alt="Desktop 5" width="250"/></td>
    <td><img src="https://i.imgur.com/koJk7St.png" alt="Desktop 6" width="250"/></td>
  </tr>
</table>

---

### Mobile View

<table>
  <tr>
    <td><img src="https://i.imgur.com/ASU7Y3x.png" alt="Mobile 1" width="150"/></td>
    <td><img src="https://i.imgur.com/syBUaFj.png" alt="Mobile 2" width="150"/></td>
    <td><img src="https://i.imgur.com/5KbHxst.png" alt="Mobile 3" width="150"/></td>
  </tr>
  <tr>
    <td><img src="https://i.imgur.com/ytHpYSc.png" alt="Mobile 4" width="150"/></td>
    <td><img src="https://i.imgur.com/rnB1UOL.png" alt="Mobile 5" width="150"/></td>
    <td><img src="https://i.imgur.com/wHx5gwl.png" alt="Mobile 6" width="150"/></td>
  </tr>
</table>

---

### Blogger Layout

<table>
  <tr>
    <td><img src="https://i.imgur.com/GMshDQm.png" alt="Blogger 1" width="180"/></td>
    <td><img src="https://i.imgur.com/0bdFr38.png" alt="Blogger 2" width="180"/></td>
    <td><img src="https://i.imgur.com/PGTuvJc.png" alt="Blogger 3" width="180"/></td>
    <td><img src="https://i.imgur.com/XKsePsc.png" alt="Blogger 4" width="180"/></td>
  </tr>
  <tr>
    <td><img src="https://i.imgur.com/4cpNYcR.png" alt="Blogger 5" width="180"/></td>
    <td><img src="https://i.imgur.com/QZETJzF.png" alt="Blogger 6" width="180"/></td>
    <td><img src="https://i.imgur.com/auXztrH.png" alt="Blogger 7" width="180"/></td>
    <td></td>
  </tr>
</table>

---

## Features

- **TMDB Movie/TV Widgets:** Effortlessly fetch and display detailed information about movies and TV series directly from TMDB, including posters, ratings, release dates, and summaries.  
- **Third-party Video Sources:** Seamlessly integrate multiple third-party video providers such as vidsrc and others, giving you flexible streaming options and better availability for your users.  
- **Custom Comment Section:** Engage your audience with a fully customized comment system tailored for your site, enabling viewers to share reviews, opinions, and discussions about their favorite movies and shows.  
- **Library Management:** Keep track of your personal or public collection of movies and series with an easy-to-use library feature, making content organization simple and intuitive.  
- **Watchlist:** Allow users to save movies and TV shows they want to watch later, providing a personalized experience and increasing user retention on your platform.  

### For Blogger Layout

- Simple and intuitive input system for configuring your own TMDB API key, making widget customization quick and hassle-free.  
- Flexible support for multiple third-party video sources, enabling you to select or switch providers according to your preferences or regional availability.  
- Responsive design optimized for Blogger, ensuring smooth performance across desktop and mobile devices.  
- Lightweight and clean codebase designed to minimize loading times and enhance user experience.  
- Easily extendable and customizable, allowing developers or advanced users to tailor features and styling to fit their unique needs.  
- And much more to help you create a professional, user-friendly movie and TV series site without complex development work.  

---


**Note:**  
No posting or data submission is done through this integration. It only fetches and displays data from TMDB.

---

## Supported TMDB API Endpoints

### 🎬 MOVIE ENDPOINTS

- movie/now_playing  
- movie/popular  
- movie/top_rated  
- movie/upcoming  
- movie/latest  
- trending/movie/day  
- trending/movie/week  
- discover/movie?sort_by=popularity.desc  
- discover/movie?with_genres=28         # Action  
- discover/movie?with_genres=35         # Comedy  
- discover/movie?with_genres=27         # Horror  
- discover/movie?with_genres=10749      # Romance  
- discover/movie?with_genres=16         # Animation  
- discover/movie?with_original_language=ja  # Japanese movies  
- discover/movie?region=US  
- discover/movie?primary_release_year=2025  

### 📺 TV SERIES ENDPOINTS

- tv/airing_today  
- tv/on_the_air  
- tv/popular  
- tv/top_rated  
- tv/latest  
- trending/tv/day  
- trending/tv/week  
- discover/tv?sort_by=popularity.desc  
- discover/tv?with_genres=16            # Animated series  
- discover/tv?with_genres=10759         # Action & Adventure  
- discover/tv?with_original_language=ja # Anime  
- discover/tv?with_original_language=ko # Kdramas  
- discover/tv?with_original_language=en  

### 🍿 ANIME (MOVIES & SERIES)

- discover/movie?with_genres=16&with_original_language=ja  
- discover/tv?with_genres=16&with_original_language=ja  

### 🔥 TRENDING

- trending/all/day  
- trending/all/week  
- trending/movie/day  
- trending/tv/week  

### 🎯 ADVANCED (with Filters)

- Popular movies in the US:  
  discover/movie?region=US&sort_by=popularity.desc  

- Latest released movies in 2025:  
  discover/movie?primary_release_year=2025&sort_by=release_date.desc  

- Sci-fi movies with rating 7+:  
  discover/movie?with_genres=878&vote_average.gte=7  

- Horror movies with 100+ votes:  
  discover/movie?with_genres=27&vote_count.gte=100  

- Crime TV shows with 100+ votes:  
  discover/tv?with_genres=80&vote_count.gte=100  

- 2024 Action & Adventure TV shows:  
  discover/tv?with_genres=10759&first_air_date_year=2024  

- Anime (Japanese language + animation genre):  
  discover/movie?with_genres=16&with_original_language=ja  
  discover/tv?with_genres=16&with_original_language=ja  

- Kdramas (Korean TV series):  
  discover/tv?with_original_language=ko  

- Japanese movies:  
  discover/movie?with_original_language=ja  

- English TV series only:  
  discover/tv?with_original_language=en  

- Upcoming movies in 2025, sorted by popularity:  
  discover/movie?primary_release_year=2025&sort_by=popularity.desc  

- Trending high-rated Romance movies:  
  discover/movie?with_genres=10749&vote_average.gte=7  

- Comedy movies in PH (Philippines):  
  discover/movie?with_genres=35&region=PH&sort_by=popularity.desc  

---

## 🎬 MOVIE GENRE CODES

| Code  | Genre             |
|-------|-------------------|
| 28    | Action            |
| 12    | Adventure         |
| 16    | Animation         |
| 35    | Comedy            |
| 80    | Crime             |
| 99    | Documentary       |
| 18    | Drama             |
| 10751 | Family            |
| 14    | Fantasy           |
| 36    | History           |
| 27    | Horror            |
| 10402 | Music             |
| 9648  | Mystery           |
| 10749 | Romance           |
| 878   | Science Fiction   |
| 10770 | TV Movie          |
| 53    | Thriller          |
| 10752 | War               |
| 37    | Western           |

---

## 📺 TV GENRE CODES

| Code  | Genre             |
|-------|-------------------|
| 10759 | Action & Adventure|
| 16    | Animation         |
| 35    | Comedy            |
| 80    | Crime             |
| 99    | Documentary       |
| 18    | Drama             |
| 10751 | Family            |
| 10762 | Kids              |
| 9648  | Mystery           |
| 10763 | News              |
| 10764 | Reality           |
| 10765 | Sci-Fi & Fantasy  |
| 10766 | Soap              |
| 10767 | Talk              |
| 10768 | War & Politics    |
| 37    | Western           |

---

# How to Use This Template

1.  **Obtain Your API Key**
    
    Get a free API key from [The Movie Database (TMDb)](https://www.themoviedb.org/settings/api). You will need to create a free account.

2.  **Add Your API Key to Your Site**
    
  To use this template, your TMDB API key must be available globally. In Blogger go to Layout →  TMDB API Gadget (Top), and paste the code below, replacing YOUR_TMDB_API_KEY with your TMDB API key.
    
    ```
    <script>
      window.apiKey = "YOUR_TMDB_API_KEY";
    </script>
    ```

3.  **Configure Homepage Content via Widgets**
    
    The homepage content is controlled by placing TMDb API endpoints into your platform's **HTML/JavaScript** widgets.
    
    *   **For the Main Slider**: Edit a specific widget (the template may look for an ID like `#Text1`) and place the desired slider endpoint inside.
        *   *Example*: `trending/movie/week`
    
    *   **For Content Rows**: Add more HTML/JavaScript widgets for each row you want to display (e.g., "Popular Movies," "Top Rated TV Shows"). Place the corresponding endpoint in each widget.
        *   *Example*: `movie/popular`
        *   *Example*: `tv/top_rated`

4.  **Customize Content (Optional)**
    
    Filter the content by adding URL parameters to your endpoints.
    
    *   *Example (Show only Action movies)*: `discover/movie?with_genres=28`
    *   *Example (Show popular movies from 2024)*: `discover/movie?sort_by=popularity.desc&year=2024`

5.  **Save and View**
    
    Save your changes. The template will automatically fetch the data and build the pages. Navigation between the homepage, details pages (`/p/details.html`), and the player (`/p/player.html`) is handled by the theme's built-in links.
    
---

## Example API URL

Fetch popular action movies released in 2024 in the US:  
`discover/movie?with_genres=28&region=US&primary_release_year=2024&sort_by=popularity.desc`

---

## Support & Contribution

Feel free to open issues or pull requests to help improve the project.

---

## Join Our Community

Join our [Telegram Group](https://t.me/abeflixgroupchat) to discuss, get support, and stay updated!


Thank you for using **MOVIEBOX** — your Blogger-based gateway to movies and TV shows powered by TMDB!
