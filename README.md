# ABEFILM - Blogger Movie & TV Database Powered by TMDB API

Welcome to **ABEFILM**, a dynamic movie and TV series website built on the Blogger platform, powered by **The Movie Database (TMDB) API**. This project enables users to browse, search, and explore movies, TV series, anime, and animations with real-time data fetched directly from TMDB.

## Introduction

ABEFILM uses TMDB API endpoints to display movie and TV show data within Blogger widgets and custom scripts. The site supports various categories and advanced filtering by genre, release year, region, and language — designed for easy use and customization on Blogger.

---

## Supported TMDB API Endpoints

### 🎬 MOVIE ENDPOINTS

movie/now_playing  
movie/popular  
movie/top_rated  
movie/upcoming  
movie/latest  
trending/movie/day  
trending/movie/week  
discover/movie?sort_by=popularity.desc  
discover/movie?with_genres=28         # Action  
discover/movie?with_genres=35         # Comedy  
discover/movie?with_genres=27         # Horror  
discover/movie?with_genres=10749      # Romance  
discover/movie?with_genres=16         # Animation  
discover/movie?with_original_language=ja  # Japanese movies  
discover/movie?region=US  
discover/movie?primary_release_year=2025  

### 📺 TV SERIES ENDPOINTS

tv/airing_today  
tv/on_the_air  
tv/popular  
tv/top_rated  
tv/latest  
trending/tv/day  
trending/tv/week  
discover/tv?sort_by=popularity.desc  
discover/tv?with_genres=16            # Animated series  
discover/tv?with_genres=10759         # Action & Adventure  
discover/tv?with_original_language=ja # Anime  
discover/tv?with_original_language=ko # Kdramas  
discover/tv?with_original_language=en  

### 🍿 ANIME (MOVIES & SERIES)

discover/movie?with_genres=16&with_original_language=ja  
discover/tv?with_genres=16&with_original_language=ja  

### 🔥 TRENDING

trending/all/day  
trending/all/week  
trending/movie/day  
trending/tv/week  

### 🎯 ADVANCED (with Filters)

# Popular movies in the US  
discover/movie?region=US&sort_by=popularity.desc  

# Latest released movies in 2025  
discover/movie?primary_release_year=2025&sort_by=release_date.desc  

# Sci-fi movies with rating 7+  
discover/movie?with_genres=878&vote_average.gte=7  

# Horror movies with 100+ votes  
discover/movie?with_genres=27&vote_count.gte=100  

# Crime TV shows with 100+ votes  
discover/tv?with_genres=80&vote_count.gte=100  

# 2024 Action & Adventure TV shows  
discover/tv?with_genres=10759&first_air_date_year=2024  

# Anime (Japanese language + animation genre)  
discover/movie?with_genres=16&with_original_language=ja  
discover/tv?with_genres=16&with_original_language=ja  

# Kdramas (Korean TV series)  
discover/tv?with_original_language=ko  

# Japanese movies  
discover/movie?with_original_language=ja  

# English TV series only  
discover/tv?with_original_language=en  

# Upcoming movies in 2025, sorted by popularity  
discover/movie?primary_release_year=2025&sort_by=popularity.desc  

# Trending high-rated Romance movies  
discover/movie?with_genres=10749&vote_average.gte=7  

# Comedy movies in PH (Philippines)  
discover/movie?with_genres=35&region=PH&sort_by=popularity.desc  

---

## 🎬 MOVIE GENRE CODES

28     # Action  
12     # Adventure  
16     # Animation  
35     # Comedy  
80     # Crime  
99     # Documentary  
18     # Drama  
10751  # Family  
14     # Fantasy  
36     # History  
27     # Horror  
10402  # Music  
9648   # Mystery  
10749  # Romance  
878    # Science Fiction  
10770  # TV Movie  
53     # Thriller  
10752  # War  
37     # Western  

## 📺 TV GENRE CODES

10759  # Action & Adventure  
16     # Animation  
35     # Comedy  
80     # Crime  
99     # Documentary  
18     # Drama  
10751  # Family  
10762  # Kids  
9648   # Mystery  
10763  # News  
10764  # Reality  
10765  # Sci-Fi & Fantasy  
10766  # Soap  
10767  # Talk  
10768  # War & Politics  
37     # Western  

---

## How to Use

1. Obtain your TMDB API Key from [https://www.themoviedb.org/](https://www.themoviedb.org/).
2. Insert your API key in your Blogger widget or script configuration.
3. Select an endpoint from the above lists to fetch and display desired content.
4. Customize endpoints by adding filters such as genres, release year, region, or language.
5. Embed widgets/scripts into your Blogger site.
6. Navigate site sections using hash URLs: `#home`, `#movies`, `#tvseries`, `#animation`.

---

## Example API URL

Fetch popular action movies released in 2024 in the US: ?with_genres=28&region=US&primary_release_year=2024&sort_by=popularity.desc


---

## Support & Contribution

Feel free to open issues or pull requests to help improve the project.

---

Thank you for using **ABEFILM** — your Blogger-based gateway to movies and TV shows powered by TMDB!


