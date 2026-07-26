export const SAVED_MOVIES_KEY = 'cinemania-saved-movies';

// localStoragede kayıtlı filmleri getir
export function readSavedMovies() {
  try {
    const data = localStorage.getItem(SAVED_MOVIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    reportError('Saved movies error:', error);
    return [];
  }
}

// film kontrol 
export function isMovieSaved(movieId) {
  const movies = readSavedMovies();
  return movies.some(movie => Number(movie.id) === Number(movieId));
}

// filmi sadeleştirme
export function normalizeMovieForLibrary(movie) {
  let genreIds = movie.genre_ids || [];
  let genreNames = movie.genre_names || [];

  if (movie.genres && Array.isArray(movie.genres)) {
    genreIds = movie.genres.map(g => (typeof g === 'object' ? g.id : g));
    genreNames = movie.genres.map(g => (typeof g === 'object' ? g.name : g));
  }

  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path || '',
    backdrop_path: movie.backdrop_path || '',
    release_date: movie.release_date || '',
    vote_average: movie.vote_average || 0,
    overview: movie.overview || '',
    genre_ids: genreIds,
    genre_names: genreNames,
  };
}

// film ekleme
export function saveMovieToLibrary(movie) {
  const movies = readSavedMovies();

  if (isMovieSaved(movie.id)) {
    return false;
  }

  const movieToAdd = normalizeMovieForLibrary(movie);
  const updatedMovies = [...movies, movieToAdd];

  localStorage.setItem(SAVED_MOVIES_KEY, JSON.stringify(updatedMovies));

  document.dispatchEvent(
    new CustomEvent('cinemania:library:add', {
      detail: movieToAdd,
    })
  );

  return true;
}

// film çıkarma
export function removeMovieFromLibrary(movieId) {
  const movies = readSavedMovies();
  const filteredMovies = movies.filter(
    movie => Number(movie.id) !== Number(movieId)
  );

  if (filteredMovies.length === movies.length) {
    return false;
  }

  localStorage.setItem(SAVED_MOVIES_KEY, JSON.stringify(filteredMovies));

  document.dispatchEvent(
    new CustomEvent('cinemania:library:remove', {
      detail: { movieId: Number(movieId) },
    })
  );

  return true;
}

// en son eklenenleri getirme
export function getLatestSavedMovie() {
  const movies = readSavedMovies();
  return movies.length > 0 ? movies[movies.length - 1] : null;
}