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
      gsap.from("#overlay-1 img", {
        opacity: 0,
        y: 30,
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
      scrub: 0.3, // Smooth scrub catch-up (adds inertia and removes laggy scroll jumps)
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
      link.classList.remove('active');
      
      const href = link.getAttribute('href');
      if (href) {
        const sectionId = href.substring(1);
        if (current === sectionId || (!current && sectionId === 'about')) {
          link.classList.add('active');
        }
      }
    });
  });

  // Tilted Photo Marquee Scroll Motion Animation
  const marqueeRow1 = document.querySelector('.marquee-row-1');
  const marqueeRow2 = document.querySelector('.marquee-row-2');
  const marqueeStage = document.querySelector('.marquee-stage');

  if (marqueeRow1 && marqueeRow2) {
    // Row 1 glides left continuously
    const tween1 = gsap.to(marqueeRow1, {
      xPercent: -50,
      repeat: -1,
      duration: 35,
      ease: "none"
    });

    // Row 2 glides right continuously
    gsap.set(marqueeRow2, { xPercent: -50 });
    const tween2 = gsap.to(marqueeRow2, {
      xPercent: 0,
      repeat: -1,
      duration: 35,
      ease: "none"
    });

    // Dynamically react to Lenis scroll velocity
    let scrollTimeout: number;
    lenis.on('scroll', (e: { velocity: number }) => {
      const vel = Math.abs(e.velocity || 0);
      const targetTimeScale = 1 + Math.min(vel * 0.4, 3.0);

      gsap.to([tween1, tween2], {
        timeScale: targetTimeScale,
        duration: 0.25,
        overwrite: "auto"
      });

      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        gsap.to([tween1, tween2], {
          timeScale: 1,
          duration: 0.8,
          ease: "power2.out"
        });
      }, 120);
    });

    // Slow down on stage hover for comfortable viewing
    if (marqueeStage) {
      marqueeStage.addEventListener('mouseenter', () => {
        gsap.to([tween1, tween2], { timeScale: 0.2, duration: 0.5 });
      });
      marqueeStage.addEventListener('mouseleave', () => {
        gsap.to([tween1, tween2], { timeScale: 1, duration: 0.5 });
      });
    }
  }

  // Concept 2: The Aperture Vault Interactivity
  const apertureBtns = document.querySelectorAll('.aperture-stop-btn');
  const apertureCategory = document.getElementById('aperture-category');
  const apertureTitle = document.getElementById('aperture-title');
  const apertureDesc = document.getElementById('aperture-desc');
  const apertureOptic = document.getElementById('aperture-optic');
  const apertureBadge = document.getElementById('aperture-badge');
  const apertureImg = document.getElementById('aperture-portrait-img') as HTMLImageElement;
  const apertureSvg = document.getElementById('aperture-blades-svg');
  const apertureGlow = document.getElementById('aperture-glow');

  const apertureData: Record<string, { category: string; title: string; desc: string; optic: string; badge: string; rotation: number; blur: string; color: string; imgSrc: string }> = {
    f14: {
      category: 'DEPTH OF FIELD: ULTRA SHALLOW (f/1.4)',
      title: 'Unfiltered Emotional Intimacy',
      desc: 'Opening wide to f/1.4 melts background distractions away, placing absolute focus on tearful eyes, tender glances, and raw human connection that words cannot articulate.',
      optic: 'OPTIC: 85mm Prime T1.2',
      badge: 'f/1.4 — Deep Focus on Emotion',
      rotation: 0,
      blur: 'blur(0px) contrast(110%)',
      color: 'rgba(197,151,26,0.15)',
      imgSrc: '/carousel/carousel_03.jpg'
    },
    f28: {
      category: 'DEPTH OF FIELD: GOLDEN HOUR CINEMA (f/2.8)',
      title: 'Sun-Drenched Destination Magic',
      desc: 'Framing golden hour flares over royal palaces and coastal horizons with organic lens flare, warm anamorphic streaks, and painterly background bokeh.',
      optic: 'OPTIC: 35mm Anamorphic T2.8',
      badge: 'f/2.8 — Golden Hour Magic',
      rotation: 45,
      blur: 'blur(0px) brightness(110%) contrast(105%)',
      color: 'rgba(212,172,41,0.2)',
      imgSrc: '/carousel/carousel_02.jpg'
    },
    f56: {
      category: 'DEPTH OF FIELD: BALANCED SCOPE (f/5.6)',
      title: 'Royal Heritage & Grand Scale',
      desc: 'Striking the perfect harmony between subject sharp detail and breathtaking architectural grandeur across palaces, mandaps, and ballrooms.',
      optic: 'OPTIC: 50mm Master Prime T1.4',
      badge: 'f/5.6 — Royal Heritage Scope',
      rotation: 90,
      blur: 'blur(0px) contrast(115%)',
      color: 'rgba(197,151,26,0.12)',
      imgSrc: '/carousel/carousel_05.jpg'
    },
    f80: {
      category: 'DEPTH OF FIELD: DOCUMENTARY REALITY (f/8.0)',
      title: 'Unscripted Rituals & Culture',
      desc: 'Deep focus capturing fast-paced cultural festivities, sacred garland exchanges, and split-second family laughter with crisp edge-to-edge clarity.',
      optic: 'OPTIC: 24mm Wide Prime T2.0',
      badge: 'f/8.0 — Documentary Reality',
      rotation: 135,
      blur: 'blur(0px) contrast(120%)',
      color: 'rgba(167,122,19,0.18)',
      imgSrc: '/carousel/carousel_07.jpg'
    },
    f11: {
      category: 'DEPTH OF FIELD: FINE ART NOIR (f/11)',
      title: 'Shadows, Stars & Dramatic Contrast',
      desc: 'High aperture precision exposing dramatic chiaroscuro lighting, editorial moonlight silhouettes, and timeless black & white fine art frames.',
      optic: 'OPTIC: 100mm Macro Prime T2.8',
      badge: 'f/11 — Fine Art Noir & Shadows',
      rotation: 180,
      blur: 'grayscale(50%) contrast(125%)',
      color: 'rgba(133,93,17,0.22)',
      imgSrc: '/carousel/carousel_08.jpg'
    }
  };

  apertureBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetBtn = e.currentTarget as HTMLButtonElement;
      const key = targetBtn.getAttribute('data-aperture') || 'f14';
      const data = apertureData[key];
      if (!data) return;

      apertureBtns.forEach(b => {
        b.classList.remove('bg-gold-400', 'text-black', 'shadow-[0_0_15px_rgba(197,151,26,0.4)]');
        b.classList.add('text-neutral-400');
      });

      targetBtn.classList.remove('text-neutral-400');
      targetBtn.classList.add('bg-gold-400', 'text-black', 'shadow-[0_0_15px_rgba(197,151,26,0.4)]');

      // Animate Card Text Swap
      if (apertureCategory && apertureTitle && apertureDesc && apertureOptic && apertureBadge) {
        gsap.to('#aperture-card', {
          opacity: 0,
          y: -10,
          duration: 0.25,
          onComplete: () => {
            apertureCategory.innerText = data.category;
            apertureTitle.innerText = data.title;
            apertureDesc.innerText = data.desc;
            apertureOptic.innerText = data.optic;
            apertureBadge.innerText = data.badge;

            gsap.to('#aperture-card', { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
          }
        });
      }

      // Animate Lens Blade Rotation & Image Swap
      if (apertureSvg) {
        gsap.to(apertureSvg, { rotate: data.rotation, duration: 0.7, ease: "power2.out" });
      }

      if (apertureGlow) {
        apertureGlow.style.backgroundColor = data.color;
      }

      if (apertureImg) {
        gsap.to(apertureImg, {
          opacity: 0,
          scale: 0.95,
          duration: 0.3,
          onComplete: () => {
            apertureImg.src = data.imgSrc;
            apertureImg.style.filter = data.blur;
            gsap.to(apertureImg, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
          }
        });
      }
    });
  });

  // Custom Cursor Initialization
  initCustomCursor();
}

function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  // Track position
  window.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });

  // Interactive Shutter Animation on Click
  window.addEventListener('mousedown', (e) => {
    gsap.to(cursor, { scale: 0.85, duration: 0.08 });
    
    const flash = document.createElement('div');
    flash.className = 'flash-ring';
    flash.style.left = `${e.clientX}px`;
    flash.style.top = `${e.clientY}px`;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    // Camera Shutter Screen Flash
    const screenFlash = document.createElement('div');
    screenFlash.className = 'screen-flash';
    document.body.appendChild(screenFlash);
    gsap.to(screenFlash, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.out',
      onComplete: () => screenFlash.remove()
    });
  });

  window.addEventListener('mouseup', () => {
    gsap.to(cursor, { scale: 1.0, duration: 0.08 });
  });

  // Interactive Hover Effects
  const interactives = document.querySelectorAll('a, button, .gallery-item, .gallery-filter-btn, input, textarea, [role="button"]');
  
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cursor, { scale: 1.25, filter: 'drop-shadow(0 4px 15px rgba(197, 151, 26, 0.4))', duration: 0.2 });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(cursor, { scale: 1.0, filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.4))', duration: 0.2 });
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
