import { searchMovies, getTrending, convertGenreIdsToNames } from './api.js';
import { initHero } from './hero.js';

document.addEventListener('DOMContentLoaded', () => {
  // Hero alanını katalog modunda tetikliyoruz
  initHero();

  // ELEMENTLERİN SEÇİLMESİ
  const searchInput = document.getElementById('searchInput');
  const yearSelectWrapper = document.getElementById('yearSelectWrapper');
  const searchForm = document.getElementById('searchForm');
  const yearMenu = document.getElementById('yearMenu');
  const customSelectTrigger = document.querySelector('.custom-select__trigger');
  const customSelectLabel = document.querySelector('.custom-select__label');
  const moviesListBlock = document.querySelector('.catalog-movies-list');

  // İKİLİ ÇARPI SİSTEMİ VE KLON KUTU
  const clearBtnDesktop = document.getElementById('clearBtnDesktop');
  const clearBtnMobile = document.getElementById('clearBtnMobile');
  const mobileCloneBox = document.getElementById('mobileCloneBox');

  // SAYFALAMA ELEMENTLERİ
  const paginationWrapper = document.getElementById('paginationWrapper');
  const paginationNumbers = document.getElementById('paginationNumbers');
  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');

  // SUNUCU TABANLI SAYFALAMA HAFIZASI (STATE)
  let currentPage = 1;
  let totalPages = 1;
  let currentQuery = '';
  let currentSelectedYear = '';
  let isSearchingMode = false;

  let activeIndex = 0;
  let options = [];

  // SAYFA İLK AÇILDIĞINDA TREND FİLMLERİ GETİRME
  async function sayfaBaslangiciniYukle() {
    try {
      isSearchingMode = false;
      if (paginationWrapper) paginationWrapper.style.display = 'none';
      if (moviesListBlock) {
        moviesListBlock.innerHTML =
          '<div class="catalog-loading">Loading trending movies...</div>';
      }

      const apiResponse = await getTrending('day');
      const trendFilmler = apiResponse ? apiResponse.results : null;

      if (
        !trendFilmler ||
        !Array.isArray(trendFilmler) ||
        trendFilmler.length === 0
      ) {
        moviesListBlock.innerHTML =
          '<div class="catalog-error-message"><p>No trending movies found.</p></div>';
        return;
      }

      moviesListBlock.innerHTML = '';
      await filmKartlariniGoster(trendFilmler, false);
    } catch (error) {
      if (moviesListBlock) {
        moviesListBlock.innerHTML = `<div class="catalog-error-message"><p>${error.message || 'An error occurred.'}</p></div>`;
      }
    }
  }

  sayfaBaslangiciniYukle();

  // FORM SUBMIT (ARAMA BAŞLANGICI)
  searchForm.addEventListener('submit', async e => {
    e.preventDefault();
    currentQuery = searchInput.value.trim();
    currentSelectedYear =
      customSelectLabel.textContent === 'Year'
        ? ''
        : customSelectLabel.textContent;

    if (!currentQuery) {
      moviesListBlock.innerHTML = `<div class="catalog-error-message"><p>Please enter a movie title to search.</p></div>`;
      if (paginationWrapper) paginationWrapper.style.display = 'none';
      return;
    }

    isSearchingMode = true;
    currentPage = 1;
    await porsiyonUcur();
  });

  // SUNUCUDAN PORSIYON ÇEKEN ANA FONKSİYON
  async function porsiyonUcur() {
    try {
      moviesListBlock.innerHTML =
        '<div class="catalog-loading">Searching movies...</div>';
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const apiResponse = await searchMovies(
        currentQuery,
        currentPage,
        currentSelectedYear
      );
      const aramaSonuclari = apiResponse ? apiResponse.results : null;
      totalPages = apiResponse ? Math.min(apiResponse.total_pages, 500) : 1;

      if (!aramaSonuclari || aramaSonuclari.length === 0) {
        moviesListBlock.innerHTML = `
          <div class="catalog-error-message">
            <h2>OOPS...</h2>
            <p>We are very sorry!</p>
            <p>We don’t have any results matching your search.</p>
          </div>
        `;
        if (paginationWrapper) paginationWrapper.style.display = 'none';
        return;
      }

      moviesListBlock.innerHTML = '';
      await filmKartlariniGoster(aramaSonuclari, false);
      renderPaginationDinamikleri();
    } catch (error) {
      moviesListBlock.innerHTML = `<div class="catalog-error-message"><p>${error.message || 'An error occurred.'}</p></div>`;
    }
  }

  // Görseldeki numaraları (01 02 ... 24) oluşturan fonksiyon
  function renderPaginationDinamikleri() {
    if (!isSearchingMode || totalPages <= 1) {
      if (paginationWrapper) paginationWrapper.style.display = 'none';
      return;
    }

    if (paginationWrapper) paginationWrapper.style.display = 'flex';
    paginationNumbers.innerHTML = '';

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    const range = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - range && i <= currentPage + range)
      ) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `pagination-btn ${i === currentPage ? 'is-active' : ''}`;
        btn.textContent = i < 10 ? `0${i}` : i;

        btn.addEventListener('click', () => {
          currentPage = i;
          porsiyonUcur();
        });
        paginationNumbers.appendChild(btn);
      } else if (i === 2 || i === totalPages - 1) {
        if (
          !paginationNumbers.lastChild ||
          paginationNumbers.lastChild.textContent !== '...'
        ) {
          const dots = document.createElement('span');
          dots.className = 'pagination-dots';
          dots.textContent = '...';
          paginationNumbers.appendChild(dots);
        }
      }
    }
  }

  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      porsiyonUcur();
    }
  });
  nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      porsiyonUcur();
    }
  });

  // FILM KARTLARINI BASMA FONKSİYONU (DİNAMİK TÜRLER ENTEGRELİ)
  async function filmKartlariniGoster(filmler, appendMode = false) {
    if (!moviesListBlock) return;
    if (!appendMode) moviesListBlock.innerHTML = '';

    for (const film of filmler) {
      const kart = document.createElement('div');
      kart.className = 'movie-card';

      const posterUrl = film.poster_path
        ? `https://image.tmdb.org/t/p/w500${film.poster_path}`
        : 'https://placehold.co/400x400?text=No+Image';

      const vizyonYili = film.release_date
        ? film.release_date.split('-')[0]
        : 'Unknown';

      let dinamikTurler = 'Unknown';
      if (film.genre_ids && film.genre_ids.length > 0) {
        const turDizisi = await convertGenreIdsToNames(film.genre_ids);
        dinamikTurler = turDizisi.slice(0, 2).join(', ');
      }

      const yildizSayisi = Math.round(film.vote_average / 2);
      const yildizlar = '★'.repeat(yildizSayisi) + '☆'.repeat(5 - yildizSayisi);

      kart.innerHTML = `
        <img class="movie-card__poster" src="${posterUrl}" alt="${film.title}" loading="lazy">
        <div class="movie-card__overlay">
          <h2 class="movie-card__title">${film.title}</h2>
          <div class="movie-card__meta">
            <div class="movie-card__details">${dinamikTurler} | ${vizyonYili}</div>
            <div class="movie-card__stars">${yildizlar}</div>
          </div>
        </div>
      `;

      kart.addEventListener('click', () => {
        console.log(`Selected Movie ID: ${film.id}`);
      });
      moviesListBlock.appendChild(kart);
    }
  }

  // YIL ÇARK SİSTEMİNİN ÇALIŞMA DÖNGÜLERİ
  function yillariDoldur() {
    const mevcutYil = new Date().getFullYear();
    const baslangicYili = 1900;

    let htmlIcerik =
      '<li class="custom-select__option custom-select__option--default" data-value="">Year</li>';
    for (let yil = mevcutYil; yil >= baslangicYili; yil--) {
      htmlIcerik += `<li class="custom-select__option" data-value="${yil}">${yil}</li>`;
    }
    htmlIcerik += '<li class="custom-select__spacer"></li>';
    yearMenu.innerHTML = htmlIcerik;
    options = Array.from(yearMenu.querySelectorAll('.custom-select__option'));
  }

  yillariDoldur();

  function merkezElemaniniBul() {
    if (options.length === 0) return;
    const menuRect = yearMenu.getBoundingClientRect();
    const menuCenter = menuRect.top + menuRect.height / 2;
    let enYakinEleman = options[0];
    let enKucukMesafe = Infinity;
    let bulunanIndex = 0;

    options.forEach((opt, idx) => {
      const optRect = opt.getBoundingClientRect();
      const optCenter = optRect.top + optRect.height / 2;
      const mesafe = Math.abs(menuCenter - optCenter);
      if (mesafe < enKucukMesafe) {
        enKucukMesafe = mesafe;
        enYakinEleman = opt;
        bulunanIndex = idx;
      }
    });

    options.forEach(opt => opt.classList.remove('is-active'));
    if (enYakinEleman) enYakinEleman.classList.add('is-active');
    activeIndex = bulunanIndex;
  }

  yearMenu.addEventListener('scroll', merkezElemaniniBul);

  customSelectTrigger.addEventListener('click', e => {
    e.stopPropagation();
    const isHidden = yearMenu.classList.toggle('hide');
    if (!isHidden) {
      customSelectTrigger.classList.add('is-open');
      setTimeout(() => {
        merkezdekiElemanaKaydir();
      }, 50);
    } else {
      menuKapat();
    }
  });

  function menuKapat() {
    yearMenu.classList.add('hide');
    customSelectTrigger.classList.remove('is-open');
    if (options[activeIndex]) {
      const secilenYil = options[activeIndex].getAttribute('data-value');
      customSelectLabel.textContent = secilenYil ? secilenYil : 'Year';
    }
  }

  function merkezdekiElemanaKaydir() {
    if (options[activeIndex]) {
      options[activeIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      merkezElemaniniBul();
    }
  }

  yearMenu.addEventListener('click', e => {
    if (e.target.classList.contains('custom-select__option')) {
      const idx = options.indexOf(e.target);
      if (idx !== -1) {
        activeIndex = idx;
        merkezdekiElemanaKaydir();
        setTimeout(menuKapat, 300);
      }
    }
  });

  customSelectTrigger.addEventListener('keydown', e => {
    if (yearMenu.classList.contains('hide')) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        customSelectTrigger.click();
        return;
      }
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeIndex < options.length - 1) {
        activeIndex++;
        merkezdekiElemanaKaydir();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex > 0) {
        activeIndex--;
        merkezdekiElemanaKaydir();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      menuKapat();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      yearMenu.classList.add('hide');
      customSelectTrigger.classList.remove('is-open');
    }
  });

  document.addEventListener('click', menuKapat);
  // INPUT VE TEMİZLEME YÖNETİMİ (MOBİL DUYARLI SATIR VE ÇARPI KONTROLLERİ)
  searchInput.addEventListener('input', e => {
    const value = e.target.value.trim();
    const searchClone = document.getElementById('searchClone');

    if (value.length > 0) {
      if (window.innerWidth < 1200) {
        // MOBİL DURUMU
        if (mobileCloneBox) mobileCloneBox.classList.add('is-active');
        if (yearSelectWrapper) yearSelectWrapper.classList.add('is-visible');
        if (searchClone) searchClone.value = value;
        if (clearBtnMobile) clearBtnMobile.style.display = 'block';
        if (clearBtnDesktop) clearBtnDesktop.style.display = 'none';
      } else {
        // MASAÜSTÜ DURUMU
        if (mobileCloneBox) mobileCloneBox.classList.remove('is-active');
        if (yearSelectWrapper) yearSelectWrapper.classList.add('is-visible');
        if (clearBtnDesktop) clearBtnDesktop.style.display = 'block';
        if (clearBtnMobile) clearBtnMobile.style.display = 'none';
      }

      // 🔥 KESİN ÇÖZÜM: Giriş yapıldığında liste kutusunun gizli kalmasını (hide) garanti ediyoruz.
      // Sadece kullanıcı "Year" butonuna kendi eliyle tıkladığında açılacak.
      if (yearMenu) {
        yearMenu.classList.add('hide');
      }
    } else {
      sıfırlaVeTemizle();
    }
  });

  function sıfırlaVeTemizle() {
    searchInput.value = '';
    if (clearBtnDesktop) clearBtnDesktop.style.display = 'none';
    if (clearBtnMobile) clearBtnMobile.style.display = 'none';
    if (mobileCloneBox) mobileCloneBox.classList.remove('is-active');
    if (yearSelectWrapper) yearSelectWrapper.classList.remove('is-visible');
    if (yearMenu) yearMenu.classList.add('hide'); // Sıfırlanınca listeyi kapat
    if (customSelectTrigger) customSelectTrigger.classList.remove('is-open');
    customSelectLabel.textContent = 'Year';
    activeIndex = 0;
  }

  if (clearBtnDesktop)
    clearBtnDesktop.addEventListener('click', () => {
      sıfırlaVeTemizle();
      searchInput.focus();
      sayfaBaslangiciniYukle();
    });
  if (clearBtnMobile)
    clearBtnMobile.addEventListener('click', () => {
      sıfırlaVeTemizle();
      searchInput.focus();
      sayfaBaslangiciniYukle();
    });
});
