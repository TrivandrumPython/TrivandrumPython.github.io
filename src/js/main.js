document.addEventListener('DOMContentLoaded', () => {
  // --- Mobile Menu ---
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.site-nav__links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close on link click (mobile)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          menuBtn.classList.remove('active');
          navLinks.classList.remove('active');
        }
      });
    });
  }

  // --- Theme Toggle ---
  const toggle = document.querySelector('.theme-toggle');
  const html = document.documentElement;
  const saved = localStorage.getItem('tripy-theme');

  if (saved) {
    html.setAttribute('data-theme', saved);
  }

  if (toggle) {
    updateIcon();
    toggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('tripy-theme', next);
      updateIcon();
    });
  }

  function updateIcon() {
    if (!toggle) return;
    const icon = toggle.querySelector('.theme-toggle__icon');
    if (icon) {
      icon.textContent = html.getAttribute('data-theme') === 'dark' ? '◐' : '◑';
    }
  }

  // --- Header shadow on scroll ---
  const header = document.querySelector('.site-header');
  if (header) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.style.boxShadow = window.scrollY > 50
            ? '0 1px 20px rgba(0,0,0,0.15)'
            : 'none';
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // --- Intersection Observer for fade-in ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.section__header, .about-card, .event-row, .past-event-card, .gallery__item, .meetup-detail, .faq-item, .cta-block').forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // Add visible class styles
  const style = document.createElement('style');
  style.textContent = '.visible { opacity: 1 !important; transform: translateY(0) !important; }';
  document.head.appendChild(style);

  // --- Gallery Lightbox ---
  const lightbox = document.getElementById('galleryLightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('.lightbox__img');
    const lightboxCounter = lightbox.querySelector('.lightbox__counter');
    const items = document.querySelectorAll('.gallery__item');
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
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
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

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    });

    // Swipe support for mobile
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff < 0) nextImage();
        else prevImage();
      }
    }, { passive: true });
  }
});
