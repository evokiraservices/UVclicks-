import './style.css';
import { gsap } from 'gsap';
import Lenis from 'lenis';

// Initialize Lenis smooth scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
  touchMultiplier: 2,
});

function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Mobile Menu Drawer Logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileDrawer = document.getElementById('mobile-drawer');
const mobileDrawerLinks = document.querySelectorAll('.mobile-drawer-link');
let isMobileMenuOpen = false;

if (mobileMenuBtn && mobileDrawer) {
  const lines = mobileMenuBtn.querySelectorAll('span');
  
  const toggleMenu = () => {
    isMobileMenuOpen = !isMobileMenuOpen;
    
    if (isMobileMenuOpen) {
      mobileDrawer.classList.remove('-translate-x-full');
      if (lines[0]) lines[0].style.transform = 'translateY(4px) rotate(45deg)';
      if (lines[1]) lines[1].style.transform = 'translateY(-4px) rotate(-45deg)';
    } else {
      mobileDrawer.classList.add('-translate-x-full');
      if (lines[0]) lines[0].style.transform = '';
      if (lines[1]) lines[1].style.transform = '';
    }
  };

  mobileMenuBtn.addEventListener('click', toggleMenu);

  mobileDrawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMobileMenuOpen) toggleMenu();
    });
  });
}

// Setup Gallery Category Filters (for gallery page)
const filterButtons = document.querySelectorAll('.gallery-filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

if (filterButtons.length > 0 && galleryItems.length > 0) {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active classes
      filterButtons.forEach(b => {
        b.classList.remove('text-gold-400', 'border-gold-500/20', 'bg-gold-950/10');
        b.classList.add('text-neutral-400', 'border-white/5');
      });

      // Add active classes to selected
      const currentBtn = e.currentTarget as HTMLButtonElement;
      currentBtn.classList.remove('text-neutral-400', 'border-white/5');
      currentBtn.classList.add('text-gold-400', 'border-gold-500/20', 'bg-gold-950/10');

      const filter = currentBtn.getAttribute('data-filter') || 'all';

      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        const element = item as HTMLElement;

        if (filter === 'all' || itemCategory === filter) {
          element.style.display = 'block';
          gsap.fromTo(element, 
            { opacity: 0, scale: 0.95 }, 
            { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
          );
        } else {
          gsap.to(element, {
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              element.style.display = 'none';
            }
          });
        }
      });
    });
  });
}

// Contact Form Simulation (for contact page)
const form = document.getElementById('contact-form') as HTMLFormElement;
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (!submitBtn) return;

    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'SENDING REQUEST...';
    submitBtn.disabled = true;

    // Simulate API submit
    setTimeout(() => {
      submitBtn.innerText = 'SUBMITTED SUCCESSFULLY!';
      submitBtn.style.background = 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
      submitBtn.style.color = '#ffffff';
      form.reset();
      
      setTimeout(() => {
        submitBtn.innerText = originalText;
        submitBtn.style.background = '';
        submitBtn.style.color = '';
        submitBtn.disabled = false;
      }, 3000);
    }, 1500);
  });
}

// Custom Cursor Initialization
initCustomCursor();

function initCustomCursor() {
  const cursorDot = document.getElementById('custom-cursor');
  const cursorRing = document.getElementById('custom-cursor-ring');

  if (!cursorDot || !cursorRing) return;

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Position dot instantly
    gsap.set(cursorDot, { x: mouseX, y: mouseY });
  });

  // Position ring with smoothing delay using GSAP ticker
  gsap.ticker.add(() => {
    const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
    ringX += (mouseX - ringX) * dt;
    ringY += (mouseY - ringY) * dt;
    gsap.set(cursorRing, { x: ringX, y: ringY });
  });

  // Interactive Hover Effects
  const interactives = document.querySelectorAll('a, button, .gallery-item, .gallery-filter-btn, input, textarea, [role="button"]');
  
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cursorDot, { scale: 1.5, backgroundColor: '#d4ac29', duration: 0.2 });
      gsap.to(cursorRing, { 
        width: 48, 
        height: 48, 
        borderColor: 'rgba(197, 151, 26, 1)', 
        backgroundColor: 'rgba(197, 151, 26, 0.1)', 
        duration: 0.2 
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(cursorDot, { scale: 1, backgroundColor: '#c5971a', duration: 0.2 });
      gsap.to(cursorRing, { 
        width: 32, 
        height: 32, 
        borderColor: 'rgba(197, 151, 26, 0.4)', 
        backgroundColor: 'rgba(197, 151, 26, 0)', 
        duration: 0.2 
      });
    });
  });
}
