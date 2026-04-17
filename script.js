// Advanced GameVerse Interactivity
// 3D carousel, mouse tilt, particles, parallax, theme toggle, loading

// Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 1500);
});

// Smooth Scroll
document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        const target = anchor.getAttribute('href');
        if (!target || target === '#') {
            return;
        }

        const section = document.querySelector(target);
        if (!section) {
            return;
        }

        e.preventDefault();
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Mobile Nav Toggle
const navToggle = document.getElementById('navToggle');
const navbar = document.querySelector('.navbar');
navToggle?.addEventListener('click', () => {
    navbar?.classList.toggle('open');
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => navbar?.classList.remove('open'));
});

// Theme Toggle
document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    document.getElementById('themeToggle').textContent = isLight ? '☀️' : '🌙';
});

// Load Theme
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('themeToggle').textContent = '☀️';
}

// 3D Carousel
const carousel = document.getElementById('liveCarousel');
carousel?.addEventListener('mouseenter', () => {
    carousel.style.animationPlayState = 'paused';
});
carousel?.addEventListener('mouseleave', () => {
    carousel.style.animationPlayState = 'running';
});

// Parallax on Scroll
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelectorAll('.parallax-layer');
    parallax.forEach(layer => {
        const speed = layer.getAttribute('data-speed') || 0.5;
        layer.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Scroll Reveal Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
        }
    });
}, observerOptions);

document.querySelectorAll('.game-card, .category-card, .stat-card, .carousel-item, .newsletter-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px) scale(0.95)';
    el.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    observer.observe(el);
});

// Canvas Particles Background for Hero
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.zIndex = '-3';
canvas.style.pointerEvents = 'none';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = 'rgba(0, 245, 160, 0.45)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

const particles = [];
for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}
animateParticles();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Newsletter Form
document.querySelector('.newsletter-form')?.addEventListener('submit', e => {
    e.preventDefault();
    alert('Subscribed! 🎮');
});

// Counter Animation for Stats (simple)
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const targetValue = Number(counter.dataset.target);
        if (!targetValue) {
            return;
        }

        const format = counter.dataset.format || 'compact';
        const suffix = counter.dataset.suffix || '';
        const prefix = counter.dataset.prefix || '';
        const formatter = new Intl.NumberFormat('en', {
            notation: format === 'compact' ? 'compact' : 'standard',
            maximumFractionDigits: 1
        });

        const increment = targetValue / 90;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                counter.textContent = prefix + formatter.format(targetValue) + suffix;
                clearInterval(timer);
            } else {
                counter.textContent = prefix + formatter.format(current) + suffix;
            }
        }, 20);
    });
}

// Trigger on scroll
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
        }
    });
});
const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// Poki.com-style Games Platform Functionality

// Games Data - Poki.com style small games
const gamesData = [
  {
    id: 1,
    title: 'Bubble Shooter',
    category: 'puzzle',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDBmNWEwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CVVdieCBSU0hPT1RFUjwvdGV4dD48L3N2Zz4=',
    description: 'Pop colorful bubbles before they reach the danger zone!',
    url: 'Game.html',
    rating: 4.8,
    plays: '1.2M'
  },
  {
    id: 2,
    title: 'Neon Runner',
    category: 'action',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY3YTAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzAwZjVhMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5FT05SVU5ORVI8L3RleHQ+PC9zdmc+',
    description: 'Dash through neon obstacles!',
    url: 'neon-runner.html',
    rating: 4.5,
    plays: '892K'
  },
  {
    id: 3,
    title: 'Pixel Jump',
    category: 'arcade',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDljZGZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzAwZjVhMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBJWEVMIEpVTVA8L3RleHQ+PC9zdmc+',
    description: 'Jump, jump, jump!',
    url: 'pixel-jump.html',
    rating: 4.7,
    plays: '2.1M'
  },
  {
    id: 4,
    title: 'Space Defender',
    category: 'shooter',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMkRkNGZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNQSUMUgREUGRU5ERVI8L3RleHQ+PC9zdmc+',
    description: 'Protect the galaxy!',
    url: 'space-defender.html',
    rating: 4.9,
    plays: '1.8M'
  },
  {
    id: 5,
    title: 'Maze Runner',
    category: 'puzzle',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjYTg4ZmRlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1BWkUgUlVOTkVSPC90ZXh0Pjwvc3ZnPg==',
    description: 'Find your way out!',
    url: 'maze-runner.html',
    rating: 4.3,
    plays: '756K'
  },
  {
    id: 6,
    title: 'Fruit Slice',
    category: 'arcade',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY2YjZiIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZSVUlUIFNM aUNFPS90ZXh0Pjwvc3ZnPg==',
    description: 'Slice the fruits!',
    url: 'fruit-slice.html',
    rating: 4.6,
    plays: '1.5M'
  },
  {
    id: 7,
    title: 'Block Puzzle',
    category: 'puzzle',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWU1YTZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJMT0NLIFBVWlRMRTwvdGV4dD48L3N2Zz4=',
    description: 'Fit all blocks!',
    url: 'block-puzzle.html',
    rating: 4.4,
    plays: '980K'
  },
  {
    id: 8,
    title: 'Rocket Dodge',
    category: 'action',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNDhlY2ZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZmZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlJPQ0tFVCBET0RHRTwvdGV4dD48L3N2Zz4=',
    description: 'Dodge incoming rockets!',
    url: 'rocket-dodge.html',
    rating: 4.7,
    plays: '2.3M'
  }
];

// Initialize Games Grid when DOM loaded
document.addEventListener('DOMContentLoaded', initGamesPlatform);

function initGamesPlatform() {
  renderGames(gamesData);
  setupEventListeners();
}

function setupEventListeners() {
  // Category filters
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.currentTarget.dataset.category;
      filterGames(category);
      updateActiveCategory(e.currentTarget);
    });
  });

  // Search
  const searchInput = document.getElementById('gamesSearch');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }

  // Hero CTA scroll to games
  document.querySelectorAll('.hero .btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('gamesSection')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function renderGames(games) {
  const container = document.getElementById('gamesGrid');
  if (!container) return;

  container.innerHTML = games.map(game => `
    <article class="game-card" data-category="${game.category}" data-title="${game.title.toLowerCase()}">
      <div class="game-thumb" style="background-image: url(${game.thumbnail})">
        <div class="game-overlay">
          <div class="game-info">
            <h3 class="game-title">${game.title}</h3>
            <div class="game-rating">⭐ ${game.rating}</div>
            <div class="game-plays">${game.plays} plays</div>
          </div>
          <button class="btn-play" data-url="${game.url}">
            <span>▶ PLAY</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');

  // Add play button handlers
  document.querySelectorAll('.btn-play').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = e.currentTarget.dataset.url;
      if (url === '#') {
        alert('Game coming soon! 🎮');
      } else {
        window.location.href = url;
      }
    });
  });

  // Masonry layout
  setTimeout(masonryLayout, 100);
}

function filterGames(category) {
  let filteredGames;
  if (category === 'all') {
    filteredGames = gamesData;
  } else {
    filteredGames = gamesData.filter(game => game.category === category);
  }
  renderGames(filteredGames);
}

function handleSearch(query) {
  const filtered = gamesData.filter(game => 
    game.title.toLowerCase().includes(query.toLowerCase()) ||
    game.description.toLowerCase().includes(query.toLowerCase())
  );
  renderGames(filtered);
}

function updateActiveCategory(activeBtn) {
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  activeBtn.classList.add('active');
}

function masonryLayout() {
  const cards = document.querySelectorAll('.game-card');
  const grid = document.getElementById('gamesGrid');
  if (!grid || cards.length === 0) return;

  cards.forEach(card => {
    card.style.height = 'auto';
  });

  const rowHeight = 320; // Approx card height
  const colCount = getComputedStyle(grid).getPropertyValue('grid-template-columns').split(' ').length;
  const rowGap = parseInt(getComputedStyle(grid).getPropertyValue('gap'));

  // Simple masonry - can enhance with more sophisticated algo
  let shortestCol = 0;
  cards.forEach((card, index) => {
    card.style.gridRowEnd = `span ${Math.ceil(Math.random() * 2 + 1)}`; // Vary heights
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Performance optimized mouse trail (optional enhancement)


