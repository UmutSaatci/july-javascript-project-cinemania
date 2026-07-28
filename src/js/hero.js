import { getTrending } from './api.js';
import { openMovieModal } from './modal.js';
const generateStarIconsMarkup = (rating, className) => {
  const starCount = Math.round((rating || 0) / 2);
  let starsHtml = '';

  for (let i = 1; i <= 5; i++) {
    if (i <= starCount) {
      starsHtml += `<span class="${className}" style="color: orange;">★</span>`;
    } else {
      starsHtml += `<span class="${className} star-empty" style="color: gray;">☆</span>`;
    }
  }

  return starsHtml;
};
const MOBILE_TABLET_MAX_WIDTH = 1279;
const OVERVIEW_MAX_LENGTH = 192;
const DEFAULT_HOME_HERO_OVERVIEW =
  "Is a guide to creating a personalized movie theater experience. You'll need a projector, screen, and speakers. Decorate your space, choose your films, and stock up on snacks for the full experience.";

let currentHeroMovie = null;
let isLibraryHero = false;
let heroResizeRafId = null;
let currentLibraryHeroMovie = null;

window.addEventListener('resize', handleHeroResize);

export async function initHero() {
  const hero = document.getElementById('hero');

  if (!hero) return;

  if (window.location.pathname.toLowerCase().includes('library')) {
    isLibraryHero = true;
    await renderLibraryHero();
    return;
  }

  try {
    const data = await getTrending('day');

    if (!data || !data.results) {
      currentHeroMovie = null;
      renderFallbackHero();
      console.error('API data error:', data);
      return;
    }

    const movies = data.results.filter(m => m.backdrop_path);

    if (movies.length === 0) {
      currentHeroMovie = null;
      renderFallbackHero();
      return;
    }

    const randomIndex = Math.floor(Math.random() * movies.length);
    const movie = movies[randomIndex];

    currentHeroMovie = movie;
    isLibraryHero = false;

    renderHero(movie);
  } catch (error) {
    console.error('Hero error:', error);
    currentHeroMovie = null;
    renderFallbackHero();
  }
}

function getAssetUrl(filename) {
  return new URL(`../img/${filename}`, import.meta.url).href;
}

function shouldTruncateOverview() {
  return window.innerWidth <= MOBILE_TABLET_MAX_WIDTH;
}

function getBackdropImageUrl(backdropPath) {
  if (!backdropPath) return '';

  if (window.innerWidth < 768) {
    return `https://image.tmdb.org/t/p/w780${backdropPath}`;
  }

  return `https://image.tmdb.org/t/p/w1280${backdropPath}`;
}

function formatOverviewText(text) {
  const overview = text?.trim() || 'No description';

  if (!shouldTruncateOverview() || overview.length <= OVERVIEW_MAX_LENGTH) {
    return overview;
  }

  return `${overview.slice(0, OVERVIEW_MAX_LENGTH).trimEnd()}...`;
}

function handleHeroResize() {
  if (heroResizeRafId) {
    cancelAnimationFrame(heroResizeRafId);
  }

  heroResizeRafId = requestAnimationFrame(() => {
    heroResizeRafId = null;

    const hero = document.getElementById('hero');

    if (!hero) return;

    if (isLibraryHero) {
      if (currentLibraryHeroMovie) {
        renderLibraryFeaturedHero(currentLibraryHeroMovie);
        return;
      }

      renderLibraryHero();
      return;
    }

    if (currentHeroMovie) {
      renderHero(currentHeroMovie);
      return;
    }

    renderFallbackHero();
  });
}

function renderHero(movie) {
  const hero = document.getElementById('hero');
  const image = getBackdropImageUrl(movie.backdrop_path);
  const starHtml = generateStarIconsMarkup(movie.vote_average, 'hero__star');

  hero.innerHTML = `
    <img
      class="hero__bg"
      src="${image}"
      alt=""
      fetchpriority="high"
      decoding="async"
      width="1280"
      height="660"
    />

    <div class="hero__overlay">
      <div class="container">
        <div class="hero__content">
          <h1 class="hero__title">${movie.title}</h1>
          <div class="hero__rating">${starHtml}</div>
          <p class="hero__overview">
            ${formatOverviewText(movie.overview)}
          </p>
          <div class="hero__actions">
            <button class="btn btn--primary">Watch trailer</button>
            <button class="btn btn--secondary">More details</button>
          </div>
        </div>
      </div>
    </div>
  `;

  attachHeroSpotlightEvents(movie);
}

function renderFallbackHero() {
  const hero = document.getElementById('hero');

  if (!hero) return;

  isLibraryHero = false;

  const mobile = getAssetUrl('hero-mobile.jpg');
  const mobile2x = getAssetUrl('hero-mobile@2x.jpg');
  const tablet = getAssetUrl('hero-tablet.jpg');
  const tablet2x = getAssetUrl('hero-tablet@2x.jpg');
  const desktop = getAssetUrl('hero-desktop.jpg');
  const desktop2x = getAssetUrl('hero-desktop@2x.jpg');

  hero.innerHTML = `
    <picture class="hero__bg-picture">
      <source media="(min-width: 1280px)" srcset="${desktop} 1x, ${desktop2x} 2x" />
      <source media="(min-width: 768px)" srcset="${tablet} 1x, ${tablet2x} 2x" />
      <img
        class="hero__bg"
        src="${mobile}"
        srcset="${mobile} 1x, ${mobile2x} 2x"
        alt="Cinema hero background"
        fetchpriority="high"
        decoding="async"
        width="1280"
        height="660"
      />
    </picture>

    <div class="hero__overlay">
      <div class="container">
        <div class="hero__content">
          <h1 class="hero__title">Let's Make Your Own Cinema</h1>
          <div class="hero__rating"></div>
          <p class="hero__overview">
            ${formatOverviewText(DEFAULT_HOME_HERO_OVERVIEW)}
          </p>
          <div class="hero__actions">
            <button class="btn btn--primary">Get started</button>
          </div>
        </div>
      </div>
    </div>
  `;

  hero.querySelector('.btn--primary')?.addEventListener('click', () => {
    window.location.href = './catalog.html';
  });
}

async function renderLibraryHero() {
  const hero = document.getElementById('hero');

  if (!hero) return;

  isLibraryHero = true;

  try {
    const data = await getTrending('day');
    const movies = data?.results?.filter(movie => movie.backdrop_path) || [];

    if (movies.length > 0) {
      const randomIndex = Math.floor(Math.random() * movies.length);
      currentLibraryHeroMovie = movies[randomIndex];
      renderLibraryFeaturedHero(currentLibraryHeroMovie);
      return;
    }
  } catch (error) {
    console.error('Library hero error:', error);
  }

  currentLibraryHeroMovie = null;

  const mobile = getAssetUrl('library-mobile.jpg');
  const mobile2x = getAssetUrl('library-mobile@2x.jpg');
  const tablet = getAssetUrl('library-tablet.jpg');
  const tablet2x = getAssetUrl('library-tablet@2x.jpg');
  const desktop = getAssetUrl('library-desktop.jpg');
  const desktop2x = getAssetUrl('library-desktop@2x.jpg');

  hero.innerHTML = `
    <picture class="hero__bg-picture">
      <source media="(min-width: 1280px)" srcset="${desktop} 1x, ${desktop2x} 2x" />
      <source media="(min-width: 768px)" srcset="${tablet} 1x, ${tablet2x} 2x" />
      <img
        class="hero__bg"
        src="${mobile}"
        srcset="${mobile} 1x, ${mobile2x} 2x"
        alt="Library background"
        fetchpriority="high"
        decoding="async"
        width="1280"
        height="660"
      />
    </picture>

    <div class="hero__overlay">
      <div class="container">
        <div class="hero__content">
          <h1 class="hero__title">Create Your Dream Cinema</h1>
          <div class="hero__rating"></div>
          <p class="hero__overview">
            ${formatOverviewText('Is a guide to designing a personalized movie theater experience with the right equipment, customized decor, and favorite films. This guide helps you bring the cinema experience into your own home with cozy seating, dim lighting, and movie theater snacks.')}
          </p>
        </div>
      </div>
    </div>
  `;
}

function renderLibraryFeaturedHero(movie) {
  const hero = document.getElementById('hero');

  if (!hero) return;

  const image = getBackdropImageUrl(movie.backdrop_path);
  const starHtml = generateStarIconsMarkup(movie.vote_average, 'hero__star');

  hero.innerHTML = `
    <img
      class="hero__bg"
      src="${image}"
      alt="${movie.title}"
      fetchpriority="high"
      decoding="async"
      width="1280"
      height="660"
    />

    <div class="hero__overlay">
      <div class="container">
        <div class="hero__content">
          <h1 class="hero__title">${movie.title}</h1>
          <div class="hero__rating">${starHtml}</div>
          <p class="hero__overview">
            ${formatOverviewText(movie.overview)}
          </p>
          <div class="hero__actions">
            <button class="btn btn--primary">Watch trailer</button>
            <button class="btn btn--secondary">More details</button>
          </div>
        </div>
      </div>
    </div>
  `;

  attachHeroSpotlightEvents(movie);
}

// Dinamik Modal Fonksiyonu (Senin Şaheser)
async function showMovieTrailerSpotlight(movie) {
  // Arka planı oluştur ve ekrana bas (Yükleniyor hissi vermek için hemen ekliyoruz)
  const backdrop = document.createElement('div');
  backdrop.className = 'spotlight-backdrop';
  document.body.appendChild(backdrop);
  document.body.classList.add('spotlight-open');

  // Fragman anahtarını API'den bekle
  const youtubeKey = await getMovieTrailerKey(movie.id);

  let modalContent = '';

  if (youtubeKey) {
    // Fragman bulunduysa YouTube Iframe şablonunu kullan
    modalContent = `
      <div class="spotlight-shell spotlight-shell--trailer">
        <button class="spotlight-close" id="trailer-close-btn"></button>
        <div class="spotlight-content--trailer" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/${youtubeKey}?autoplay=1" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);"
          ></iframe>
        </div>
      </div>
    `;
  } else {
    // Fragman bulunamadıysa senin CSS'ini yazdığın OOPS (Fallback) şablonunu kullan
    modalContent = `
      <div class="spotlight-shell spotlight-shell--trailer">
        <button class="spotlight-close" id="trailer-close-btn"></button>
        <div class="spotlight-content--trailer">
          <div class="spotlight-trailer-fallback">
            <div class="spotlight-trailer-fallback__copy">
              <h2 class="spotlight-trailer-fallback__title">OOPS...</h2>
              <p class="spotlight-trailer-fallback__text">We are very sorry!<br>But we couldn't find the trailer.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // İçeriği arka plana ekle
  backdrop.innerHTML = modalContent;

  // Kapatma Olayları (Events)
  const closeBtn = backdrop.querySelector('#trailer-close-btn');
  const closeModal = () => {
    backdrop.remove();
    document.body.classList.remove('spotlight-open');
  };

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal();
  });
  window.addEventListener('keydown', function onEsc(e) {
    if (e.code === 'Escape') {
      closeModal();
      window.removeEventListener('keydown', onEsc);
    }
  });
}

// TMDB API'den filmin YouTube fragman key'ini çeken fonksiyon
async function getMovieTrailerKey(movieId) {
  const API_KEY = 'd6a19efda452b456e766d6a2dd5e91a2'; 
  const url = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // Gelen sonuçlar arasından YouTube ve Trailer (Fragman) olanı bul
    const trailer = data.results.find(
      video => video.site === 'YouTube' && video.type === 'Trailer'
    );

    return trailer ? trailer.key : null;
  } catch (error) {
    console.error('Fragman çekilirken hata oluştu:', error);
    return null;
  }
}