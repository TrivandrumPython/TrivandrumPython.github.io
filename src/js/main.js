(function(root, factory) {
  const TriPyEvents = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = TriPyEvents;
  }

  root.TriPyEvents = TriPyEvents;

  if (root.document) {
    root.document.addEventListener('DOMContentLoaded', () => {
      TriPyEvents.init(root.document, root);
    });
  }
})(typeof window !== 'undefined' ? window : globalThis, function() {
  function parseLocalDate(dateValue) {
    if (dateValue instanceof Date) {
      return new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
    }

    const value = String(dateValue);
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    const parsed = new Date(value);
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  function isUpcomingDate(dateValue, today = new Date()) {
    return parseLocalDate(dateValue) >= parseLocalDate(today);
  }

  function isWithinDays(dateValue, days, today = new Date()) {
    const start = parseLocalDate(today);
    const limit = new Date(start);
    limit.setDate(limit.getDate() + Number(days));

    const eventDate = parseLocalDate(dateValue);
    return eventDate >= start && eventDate <= limit;
  }

  function formatDate(dateValue, options) {
    return parseLocalDate(dateValue).toLocaleDateString('en-US', options);
  }

  function updateAnnouncementBanners(documentRef, today = new Date()) {
    const banners = documentRef.querySelectorAll('.announcement-banner[data-event-date]');
    let shown = false;

    for (const banner of banners) {
      const shouldShow = !shown && isWithinDays(banner.dataset.eventDate, 45, today);
      banner.style.display = shouldShow ? '' : 'none';
      shown = shown || shouldShow;
    }
  }

  function updateEventRows(documentRef, today = new Date()) {
    const section = documentRef.querySelector('.events-page-section');
    if (!section) return;

    const upcomingList = section.querySelector('[data-event-list="upcoming"]');
    const pastList = section.querySelector('[data-event-list="past"]');
    if (!upcomingList || !pastList) return;

    const rows = Array.from(section.querySelectorAll('[data-event-row][data-event-date]'));
    for (const row of rows) {
      const status = isUpcomingDate(row.dataset.eventDate, today) ? 'upcoming' : 'past';
      setEventRowStatus(row, status);
      (status === 'upcoming' ? upcomingList : pastList).appendChild(row);
    }

    sortRows(upcomingList, 'asc');
    sortRows(pastList, 'desc');
    updateNextBadge(upcomingList);
    updateGroupVisibility(section, 'upcoming');
    updateGroupVisibility(section, 'past');
  }

  function updateHomeEvents(documentRef, today = new Date()) {
    const section = documentRef.querySelector('[data-home-events-section]');
    if (!section) return;

    const list = section.querySelector('[data-home-event-list]');
    const emptyState = section.querySelector('[data-home-empty-state]');
    if (!list || !emptyState) return;

    const rows = Array.from(list.querySelectorAll('[data-event-row][data-event-date]'));
    for (const row of rows) {
      const upcoming = isUpcomingDate(row.dataset.eventDate, today);
      row.hidden = !upcoming;
      if (upcoming) {
        setEventRowStatus(row, 'upcoming');
      }
    }

    sortRows(list, 'asc');
    const visibleRows = rows.filter(row => !row.hidden);
    updateNextBadge(list);
    list.hidden = visibleRows.length === 0;
    emptyState.hidden = visibleRows.length > 0;
  }

  function setEventRowStatus(row, status) {
    const dateValue = row.dataset.eventDate;
    const day = row.querySelector('.event-row__day');
    const primaryMeta = row.querySelector('[data-event-meta-primary]');

    row.classList.toggle('event-row--past', status === 'past');

    if (day) {
      day.textContent = status === 'past'
        ? (row.dataset.eventYear || formatDate(dateValue, { year: 'numeric' }))
        : (row.dataset.eventWeekday || formatDate(dateValue, { weekday: 'long' }));
    }

    if (primaryMeta) {
      primaryMeta.textContent = status === 'past'
        ? (row.dataset.eventReadableDate || formatDate(dateValue, { month: 'long', day: 'numeric', year: 'numeric' }))
        : row.dataset.eventTime;
    }

    const nextBadge = row.querySelector('[data-event-next-badge]');
    if (nextBadge) {
      nextBadge.hidden = true;
    }
  }

  function sortRows(list, direction) {
    const rows = Array.from(list.querySelectorAll('[data-event-row][data-event-date]'));
    rows
      .sort((a, b) => {
        const diff = parseLocalDate(a.dataset.eventDate) - parseLocalDate(b.dataset.eventDate);
        return direction === 'asc' ? diff : -diff;
      })
      .forEach(row => list.appendChild(row));
  }

  function updateNextBadge(upcomingList) {
    const rows = Array.from(upcomingList.querySelectorAll('[data-event-row]'));
    rows.forEach(row => {
      const nextBadge = row.querySelector('[data-event-next-badge]');
      if (nextBadge) {
        nextBadge.hidden = true;
      }
    });

    const visibleRows = rows.filter(row => !row.hidden);
    if (!visibleRows.length) return;

    const badges = visibleRows[0].querySelector('.event-row__badges');
    if (!badges) return;

    let nextBadge = visibleRows[0].querySelector('[data-event-next-badge]');
    if (!nextBadge) {
      nextBadge = visibleRows[0].ownerDocument.createElement('span');
      nextBadge.className = 'badge badge--next';
      nextBadge.dataset.eventNextBadge = '';
      nextBadge.textContent = 'Next up';
      badges.appendChild(nextBadge);
    }
    nextBadge.hidden = false;
  }

  function updateGroupVisibility(section, groupName) {
    const group = section.querySelector(`[data-event-group="${groupName}"]`);
    const list = section.querySelector(`[data-event-list="${groupName}"]`);
    if (group && list) {
      group.hidden = list.querySelectorAll('[data-event-row]').length === 0;
    }
  }

  function updateEventDetail(documentRef, today = new Date()) {
    const eventPage = documentRef.querySelector('[data-event-page][data-event-date]');
    if (!eventPage) return;

    const upcoming = isUpcomingDate(eventPage.dataset.eventDate, today);
    eventPage.querySelectorAll('[data-event-future-only]').forEach(element => {
      element.hidden = !upcoming;
    });
  }

  function initUi(documentRef, windowRef) {
    // --- Mobile Menu ---
    const menuBtn = documentRef.querySelector('.mobile-menu-btn');
    const navLinks = documentRef.querySelector('.site-nav__links');

    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
      });

      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          if (windowRef.innerWidth <= 768) {
            menuBtn.classList.remove('active');
            navLinks.classList.remove('active');
          }
        });
      });
    }

    // --- Theme Toggle ---
    const toggle = documentRef.querySelector('.theme-toggle');
    const html = documentRef.documentElement;
    const saved = windowRef.localStorage && windowRef.localStorage.getItem('tripy-theme');

    if (saved) {
      html.setAttribute('data-theme', saved);
    }

    function updateIcon() {
      if (!toggle) return;
      const icon = toggle.querySelector('.theme-toggle__icon');
      if (icon) {
        icon.textContent = html.getAttribute('data-theme') === 'dark' ? '◐' : '◑';
      }
    }

    if (toggle) {
      updateIcon();
      toggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        if (windowRef.localStorage) {
          windowRef.localStorage.setItem('tripy-theme', next);
        }
        updateIcon();
      });
    }

    // --- Header shadow on scroll ---
    const header = documentRef.querySelector('.site-header');
    if (header) {
      let ticking = false;
      windowRef.addEventListener('scroll', () => {
        if (!ticking) {
          windowRef.requestAnimationFrame(() => {
            header.style.boxShadow = windowRef.scrollY > 50
              ? '0 1px 20px rgba(0,0,0,0.15)'
              : 'none';
            ticking = false;
          });
          ticking = true;
        }
      });
    }

    // --- Intersection Observer for fade-in ---
    if (windowRef.IntersectionObserver) {
      const observer = new windowRef.IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      documentRef.querySelectorAll('.section__header, .about-card, .event-row, .past-event-card, .gallery__item, .meetup-detail, .faq-item, .cta-block').forEach((el) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
      });

      const style = documentRef.createElement('style');
      style.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
      documentRef.head.appendChild(style);
    }

    initLightbox(documentRef);
  }

  function initLightbox(documentRef) {
    const lightbox = documentRef.getElementById('galleryLightbox');
    if (!lightbox) return;

    const lightboxImg = lightbox.querySelector('.lightbox__img');
    const lightboxCounter = lightbox.querySelector('.lightbox__counter');
    const items = documentRef.querySelectorAll('.gallery__item');
    const sources = Array.from(items).map(item => item.querySelector('img').src);
    let currentIndex = 0;

    function showImage(index) {
      currentIndex = index;
      lightboxImg.classList.remove('loaded');
      lightboxImg.src = sources[index];
      lightboxImg.onload = () => lightboxImg.classList.add('loaded');
      lightboxCounter.textContent = (index + 1) + ' / ' + sources.length;
    }

    function openLightbox(index) {
      showImage(index);
      lightbox.classList.add('active');
      documentRef.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      documentRef.body.style.overflow = '';
    }

    function nextImage() {
      showImage((currentIndex + 1) % sources.length);
    }

    function prevImage() {
      showImage((currentIndex - 1 + sources.length) % sources.length);
    }

    items.forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index, 10);
        openLightbox(index);
      });
    });

    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__prev').addEventListener('click', prevImage);
    lightbox.querySelector('.lightbox__next').addEventListener('click', nextImage);

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    documentRef.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('active')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowRight') nextImage();
      if (event.key === 'ArrowLeft') prevImage();
    });

    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (event) => {
      touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (event) => {
      const diff = event.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff < 0) nextImage();
        else prevImage();
      }
    }, { passive: true });
  }

  function init(documentRef, windowRef) {
    updateAnnouncementBanners(documentRef);
    updateEventRows(documentRef);
    updateHomeEvents(documentRef);
    updateEventDetail(documentRef);
    initUi(documentRef, windowRef);
  }

  return {
    init,
    isUpcomingDate,
    isWithinDays,
    parseLocalDate,
    updateAnnouncementBanners,
    updateEventRows,
    updateHomeEvents,
    updateEventDetail
  };
});
