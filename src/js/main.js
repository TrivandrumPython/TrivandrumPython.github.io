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
});
