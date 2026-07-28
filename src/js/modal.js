import {
  isMovieSaved,
  saveMovieToLibrary,
  removeMovieFromLibrary,
} from './library-storage.js';

const refs = {
  backdrop: document.getElementById('movie-modal-backdrop'),
  closeBtn: document.getElementById('modal-close-btn'),
  poster: document.getElementById('modal-poster'),
  title: document.getElementById('modal-title'),
  vote: document.getElementById('modal-vote'),
  votesCount: document.getElementById('modal-votes-count'),
  popularity: document.getElementById('modal-popularity'),
  genre: document.getElementById('modal-genre'),
  overview: document.getElementById('modal-overview'),
  libraryBtn: document.getElementById('library-toggle-btn'),
};

let currentMovie = null;

export function openMovieModal(movieData) {
  if (!movieData || !refs.backdrop) return;
  currentMovie = movieData;

  populateModalData(movieData);

  refs.backdrop.classList.remove('is-hidden');
  document.body.classList.add('modal-open');

  window.addEventListener('keydown', onEscKeyPress);
  refs.backdrop.addEventListener('click', onBackdropClick);
  refs.closeBtn.addEventListener('click', closeMovieModal);
  refs.libraryBtn.addEventListener('click', onLibraryBtnClick);
}

export function closeMovieModal() {
  if (!refs.backdrop) return;

  refs.backdrop.classList.add('is-hidden');
  document.body.classList.remove('modal-open');

  window.removeEventListener('keydown', onEscKeyPress);
  refs.backdrop.removeEventListener('click', onBackdropClick);
  refs.closeBtn.removeEventListener('click', closeMovieModal);
  refs.libraryBtn.removeEventListener('click', onLibraryBtnClick);
}

function onEscKeyPress(event) {
  if (event.code === 'Escape') closeMovieModal();
}

function onBackdropClick(event) {
  if (event.target === refs.backdrop) closeMovieModal();
}

function populateModalData(movie) {
  const {
    id,
    title,
    poster_path,
    vote_average,
    vote_count,
    popularity,
    genres,
    overview,
  } = movie;

  if (poster_path) {
    refs.poster.src = poster_path.startsWith('http')
      ? poster_path
      : `https://image.tmdb.org/t/p/w500${poster_path}`;
  } else {
    refs.poster.src = 'https://via.placeholder.com/300x450?text=No+Poster';
  }

  refs.poster.alt = title || 'Movie Poster';
  refs.title.textContent = title || 'Untitled';
  refs.vote.textContent = vote_average ? vote_average.toFixed(1) : '0.0';
  refs.votesCount.textContent = vote_count ? vote_count : '0';
  refs.popularity.textContent = popularity ? popularity.toFixed(1) : '0.0';

  if (genres && Array.isArray(genres) && genres.length > 0) {
    refs.genre.textContent = genres.map(g => (typeof g === 'object' ? g.name : g)).join(', ');
  } else {
    refs.genre.textContent = 'N/A';
  }

  refs.overview.textContent =
    overview || 'No description available for this movie.';

  updateButtonState(id);
}

function updateButtonState(movieId) {
  const isSaved = isMovieSaved(movieId);

  if (isSaved) {
    refs.libraryBtn.textContent = 'Remove from My Library';
    refs.libraryBtn.classList.add('active');
  } else {
    refs.libraryBtn.textContent = 'Add to My Library';
    refs.libraryBtn.classList.remove('active');
  }
}

function onLibraryBtnClick() {
  if (!currentMovie) return;

  const isSaved = isMovieSaved(currentMovie.id);

  if (isSaved) {
    removeMovieFromLibrary(currentMovie.id);
    refs.libraryBtn.textContent = 'Add to My Library';
    refs.libraryBtn.classList.remove('active');
  } else {
    saveMovieToLibrary(currentMovie);
    refs.libraryBtn.textContent = 'Remove from My Library';
    refs.libraryBtn.classList.add('active');
  }
}