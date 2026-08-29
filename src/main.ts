import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Elements
const canvas = document.getElementById('scroll-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const progressBar = document.getElementById('progress-bar') as HTMLElement;
const progressText = document.getElementById('progress-text') as HTMLElement;

// Preload Configuration
const frameCount = 240;
const images: HTMLImageElement[] = [];
let loadedCount = 0;
const frameObj = { frame: 0 };
let imgWidth = 1920;
let imgHeight = 1080;

// Setup Canvas Size and Initial Render
function drawFrame(imgIndex: number) {
  const img = images[imgIndex];
  if (!img) return;

  ctx.clearRect(0, 0, imgWidth, imgHeight);
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
}

function resizeCanvas() {
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  drawFrame(Math.round(frameObj.frame));
}

// Preload Images
function preloadImages(onProgress: (percent: number) => void, onComplete: () => void) {
  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    const frameNum = String(i).padStart(4, '0');
    
    // Load WebP frame
    img.src = `/frames/frame_${frameNum}.webp`;
    
    img.onload = () => {
      if (loadedCount === 0) {
        imgWidth = img.naturalWidth || 1920;
        imgHeight = img.naturalHeight || 1080;
      }
      loadedCount++;
      const progress = loadedCount / frameCount;
      onProgress(progress);
      if (loadedCount === frameCount) {
        onComplete();
      }
    };
    
    img.onerror = () => {
      // Continue anyway even if a frame fails
      loadedCount++;
      const progress = loadedCount / frameCount;
      onProgress(progress);
      if (loadedCount === frameCount) {
        onComplete();
      }
    };
    
    images.push(img);
  }
}

// Initialize Application
function initApp() {
  // Hide preloader
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
      preloader.remove();
      document.body.classList.remove('loading');
      
      // Animate Navbar and first overlay on load
      gsap.from("header, aside", { opacity: 0, y: -20, duration: 1, ease: "power2.out" });
      gsap.from("#overlay-1 img, #overlay-1 h1, #overlay-1 p", {
        opacity: 0,
        y: 30,
        stagger: 0.2,
        duration: 1.2,
        ease: "power3.out"
      });
    }, 700);
  }

  // Set up resize handler
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Initialize Lenis smooth scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
    touchMultiplier: 2,
  });

  // Link Lenis scroll to ScrollTrigger updates
  lenis.on('scroll', ScrollTrigger.update);

  // Bind GSAP ticker to Lenis requestAnimationFrame
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // Setup main scroll timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#hero-scroll-container",
      start: "top top",
      end: "+=4500", // Scroll length
      scrub: 1, // Smooth scrub catch-up (adds inertia and removes laggy scroll jumps)
      pin: true,
    },
    onUpdate: () => {
      // Draw matching frame on timeline update
      drawFrame(Math.round(frameObj.frame));
    }
  });

  // 1. Frame Scrubbing Animation (lasts duration of timeline)
  tl.to(frameObj, {
    frame: frameCount - 1,
    ease: "none",
    duration: 10,
  }, 0);

  // 2. Overlay 1: Intro (starts visible, fades out early)
  tl.to("#overlay-1", {
    opacity: 0,
    y: -80,
    scale: 0.95,
    ease: "power2.inOut",
    duration: 2,
  }, 0);

  // 3. Overlay 2: Philosophy (fades in and then out)
  tl.fromTo("#overlay-2", 
    { opacity: 0, y: 80, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, ease: "power2.out", duration: 1.5 },
    2.5
  );
  tl.to("#overlay-2", 
    { opacity: 0, y: -80, scale: 0.95, ease: "power2.in", duration: 1.5 },
    4.5
  );

  // 4. Overlay 3: Cinematic Focus (fades in and then out)
  tl.fromTo("#overlay-3", 
    { opacity: 0, y: 80, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, ease: "power2.out", duration: 1.5 },
    5.5
  );
  tl.to("#overlay-3", 
    { opacity: 0, y: -80, scale: 0.95, ease: "power2.in", duration: 1.5 },
    7.5
  );

  // 5. Overlay 4: Preserve Legacy & CTA (fades in at the end and stays)
  tl.fromTo("#overlay-4", 
    { opacity: 0, y: 80, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, ease: "power2.out", duration: 1.5 },
    8.5
  );

  // Setup Gallery Category Filters
  const filterButtons = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

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

  // Contact Form Simulation
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

  // Scroll Spy for Sidebar Navigation Highlight
  const sections = document.querySelectorAll('section, #hero-scroll-container');
  const navLinks = document.querySelectorAll('.nav-sidebar-link');

  window.addEventListener('scroll', () => {
    let current: string | null = null;
    
    sections.forEach(section => {
      const sectionTop = (section as HTMLElement).offsetTop;
      const sectionHeight = (section as HTMLElement).clientHeight;
      if (window.scrollY >= sectionTop - sectionHeight / 3) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('text-gold-400');
      link.classList.add('text-neutral-400');
      
      const href = link.getAttribute('href');
      if (href) {
        const sectionId = href.substring(1);
        if (current === sectionId || (!current && sectionId === 'about')) {
          link.classList.remove('text-neutral-400');
          link.classList.add('text-gold-400');
        }
      }
    });
  });
}

// Start preloading frames
preloadImages(
  (progress) => {
    // Update progress elements
    const percent = Math.round(progress * 100);
    progressBar.style.width = `${percent}%`;
    progressText.innerText = `${percent}%`;
  },
  () => {
    // On complete, initialize the site
    initApp();
  }
);
