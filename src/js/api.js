import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_KEY;

export const TMDB_CONFIG_ERROR =
  'TMDB live data is unavailable because VITE_TMDB_KEY is missing.';
export const hasTmdbKey = () => Boolean(API_KEY);
export const getApiKey = () => API_KEY;

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
});

const fetchData = async (url, params = {}) => {
  if (!hasTmdbKey()) {
    throw new Error(TMDB_CONFIG_ERROR);
  }

  const response = await api.get(url, {
    params: {
      api_key: API_KEY,
      ...params,
    },
  });

  return response.data;
};

export const getTrending = (timeWindow = 'day') =>
  fetchData(`/trending/movie/${timeWindow}`);

export const getTrendingPaged = (page = 1, timeWindow = 'week') =>
  fetchData(`/trending/movie/${timeWindow}`, { page });

export const getUpcoming = () => fetchData('/movie/upcoming');

export const searchMovies = (query, page = 1, year = '') =>
  fetchData('/search/movie', {
    query,
    page,
    primary_release_year: year || undefined,
  });

export const getMovieDetails = movieId => fetchData(`/movie/${movieId}`);

export const getMovieVideos = movieId => fetchData(`/movie/${movieId}/videos`);

let genreMapCache = null;

export const getGenres = async () => {
  if (genreMapCache) return genreMapCache;

  const data = await fetchData('/genre/movie/list');

  genreMapCache = new Map(data.genres.map(genre => [genre.id, genre.name]));

  return genreMapCache;
};

export const convertGenreIdsToNames = async genreIds => {
  const genreMap = await getGenres();

  return genreIds.map(id => genreMap.get(id) || 'Unknown');
};
