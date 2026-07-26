import { initHeader } from './header.js';
import { initHero } from './hero.js';
import './footer.js';
import { hideGlobalLoader, initGlobalUi, showGlobalLoader } from './uz.js';
import { convertGenreIdsToNames, getGenres } from './api.js';
import { readSavedMovies } from './library-storage.js';
import { showMovieSpotlight } from './movie-spotlight.js';
import { generateStarIconsMarkup } from './star-icons.js';

let allMovies = [];
let filteredMovies = [];
let currentPage = 1;
const perPage = 9;

// sayfa yüklendiğinde çalışacak ana fonksiyon
async function initLibraryPage() {
  initGlobalUi();
  initHeader();
  showGlobalLoader();

  try {
    await initHero();
    await setupLibrary();
  } catch (error) {
    console.error('Library yüklenirken hata oluştu:', error);
  } finally {
    hideGlobalLoader();
  }
}

async function setupLibrary() {
  const container = document.getElementById('libraryGallery');
  const loadMoreBtn = document.getElementById('loadMore');
  const genreFilter = document.getElementById('genreFilter');

  if (!container) return;

  allMovies = readSavedMovies();
  filteredMovies = [...allMovies];

  if (allMovies.length === 0) {
    renderEmptyState(container, loadMoreBtn, genreFilter);
    return;
  }

  const genreMap = await getGenres();
  setupGenreDropdown(genreFilter, genreMap, container, loadMoreBtn);
  renderLibraryPage(container, loadMoreBtn);

  // load more butonuna tıklama
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      currentPage++;
      renderLibraryPage(container, loadMoreBtn);
    });
  }

  // film kartlarına tıklama dinleyicisi
  container.addEventListener('click', e => {
    const card = e.target.closest('.movie-card');
    if (card) {
      showMovieSpotlight(card.dataset.id);
    }
  });

  // film eklendiğinde veya silindiğinde sayfayı yenile
  document.addEventListener('cinemania:library:add', () => refreshLibrary(container, loadMoreBtn));
  document.addEventListener('cinemania:library:remove', () => refreshLibrary(container, loadMoreBtn));
}

// kütüphane boşsa gösterilecek alan
function renderEmptyState(container, loadMoreBtn, genreFilter) {
  if (loadMoreBtn) loadMoreBtn.classList.add('is-hidden');
  if (genreFilter) genreFilter.classList.add('is-hidden');

  container.innerHTML = `
    <div class="empty-state">
      <p class="empty-text">OOPS...<br>We are very sorry!<br>You don't have any movies<br>at your library.</p>
      <a href="./catalog.html" class="btn-search-more">Search Movie</a>
    </div>
  `;
}

// tür filtresini doldurma ve tıklama işlemleri
function setupGenreDropdown(genreFilter, genreMap, container, loadMoreBtn) {
  if (!genreFilter) return;

  const list = genreFilter.querySelector('.custom-select__list');
  const button = genreFilter.querySelector('.custom-select__button');
  const label = genreFilter.querySelector('.custom-select__label');

  if (!list || !button || !label) return;

  const availableGenreIds = new Set();
  allMovies.forEach(m => m.genre_ids?.forEach(id => availableGenreIds.add(id)));

  // "All Genres" seçeneği
  const allOption = document.createElement('li');
  allOption.dataset.value = 'all';
  allOption.textContent = 'All Genres';
  allOption.classList.add('selected');
  list.appendChild(allOption);

  // mevcut türleri listeye ekle
  availableGenreIds.forEach(id => {
    const name = genreMap.get(id);
    if (name) {
      const li = document.createElement('li');
      li.dataset.value = id;
      li.textContent = name;
      list.appendChild(li);
    }
  });

  // açılır menüyü aç/kapa
  button.addEventListener('click', e => {
    e.stopPropagation();
    list.classList.toggle('hide');
  });

  document.addEventListener('click', e => {
    if (!genreFilter.contains(e.target)) {
      list.classList.add('hide');
    }
  });

  // tür seçildiğinde
  list.addEventListener('click', e => {
    const li = e.target.closest('li');
    if (!li) return;

    list.querySelectorAll('li').forEach(item => item.classList.remove('selected'));
    li.classList.add('selected');
    label.textContent = li.textContent;
    list.classList.add('hide');

    const selectedId = li.dataset.value;
    currentPage = 1;
    container.innerHTML = '';

    filteredMovies = selectedId === 'all'
      ? allMovies
      : allMovies.filter(m => m.genre_ids?.includes(Number(selectedId)));

    renderLibraryPage(container, loadMoreBtn);
  });
}

// sayfa sayfa filmleri ekrana basma
async function renderLibraryPage(container, loadMoreBtn) {
  const start = (currentPage - 1) * perPage;
  const end = start + perPage;
  const slice = filteredMovies.slice(start, end);

  if (end >= filteredMovies.length) {
    if (loadMoreBtn) loadMoreBtn.classList.add('is-hidden');
  } else {
    if (loadMoreBtn) loadMoreBtn.classList.remove('is-hidden');
  }

  const cardsHtml = await Promise.all(
    slice.map(async movie => {
      const genres = movie.genre_names?.length > 0
        ? movie.genre_names
        : await convertGenreIdsToNames(movie.genre_ids || []);

      const year = movie.release_date ? movie.release_date.slice(0, 4) : '—';
      const poster = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : './img/oops-logo.png';

      const rating = (movie.vote_average || 0).toFixed(1);

      return `
        <li class="movie-card" data-id="${movie.id}">
          <div class="movie-card__thumb">
            <img class="movie-card__img" src="${poster}" alt="${movie.title}" loading="lazy" />
            <div class="movie-card__overlay">
              <span class="movie-card__rating">${rating}</span>
            </div>
          </div>
          <h3 class="movie-card__title">${movie.title}</h3>
          <div class="movie-card__meta">
            <p>${genres.slice(0, 2).join(', ')} | ${year}</p>
          </div>
        </li>`;
    })
  );

  container.innerHTML += cardsHtml.join('');
}

// film ekleme-çıkarmada listeyi güncelleme
function refreshLibrary(container, loadMoreBtn) {
  allMovies = readSavedMovies();
  filteredMovies = [...allMovies];
  currentPage = 1;
  container.innerHTML = '';

  if (allMovies.length === 0) {
    renderEmptyState(container, loadMoreBtn);
    return;
  }

  renderLibraryPage(container, loadMoreBtn);
}

// başlatıcı
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLibraryPage, { once: true });
} else {
  initLibraryPage();
}