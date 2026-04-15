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

// Search Toggle
document.getElementById('searchToggle').addEventListener('click', () => {
    const searchBar = document.getElementById('searchBar');
    searchBar.classList.toggle('active');
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

// Performance optimized mouse trail (optional enhancement)

