import { openMovieModal } from './main.js';

export function createCardHtml(movie, genreMap) {
  const year = movie.release_date ? movie.release_date.slice(0, 4) : 'N/A';

  let names = [];
  if (movie.genres && movie.genres.length > 0) {
    names = movie.genres.slice(0, 2).map(g => g.name);
  } else if (movie.genre_ids && movie.genre_ids.length > 0) {
    names = movie.genre_ids
      .slice(0, 2)
      .map(id => genreMap[id])
      .filter(Boolean);
  }
  const genres = names.length > 0 ? names.join(', ') : 'Other';

  const rating = Math.round((movie.vote_average || 0) / 2);
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) starsHtml += '★';
    else starsHtml += '<span class="star-empty">★</span>';
  }

  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750';

  return `
    <li class="movie-card" data-id="${movie.id}">
      <img src="${poster}" class="movie-poster" alt="${movie.title || movie.name}" />
      <h3 class="movie-card-title">${movie.title || movie.name}</h3>
      <div class="movie-card-info">
        <div class="movie-card-details">${genres} | ${year}</div>
        <div class="movie-stars">${starsHtml}</div>
      </div>
    </li>
  `;
}

export function attachCardClickEvent(containerElement, movieDataArray) {
  containerElement.addEventListener('click', event => {
    const clickedCard = event.target.closest('.movie-card');
    if (!clickedCard) return;

    const movieId = clickedCard.dataset.id;

    const selectedMovie = movieDataArray.find(m => m.id.toString() === movieId);

    if (selectedMovie) {
      if (typeof openMovieModal === 'function') {
        openMovieModal(selectedMovie);
      } else {
        console.error(
          'openMovieModal fonksiyonu bulunamadı, import yolunu kontrol et!'
        );
      }
    }
  });
}
