document.addEventListener('DOMContentLoaded', () => {

    /* ═══════════════════════════════════════════
       1. LOADER
    ═══════════════════════════════════════════ */
    const loader = document.getElementById('loader');
    let pctTick = null;

    const loaderBar = loader.querySelector('.loader-bar');
    if (loaderBar) {
        const pctEl = document.createElement('span');
        pctEl.className = 'loader-pct';
        pctEl.textContent = '0%';
        loaderBar.appendChild(pctEl);
        const pctStart = Date.now();
        pctTick = setInterval(() => {
            const p = Math.min((Date.now() - pctStart) / 1500, 1);
            const eased = 1 - Math.pow(1 - p, 2.4);
            pctEl.textContent = Math.floor(eased * 99) + '%';
            if (p >= 1) { clearInterval(pctTick); pctTick = null; }
        }, 28);
    }

    // Pre-empty typewriter word so it's blank during hero anim
    const twEl = document.querySelector('.hero-red');
    if (twEl) twEl.textContent = '';

    const hideLoader = () => {
        if (pctTick) { clearInterval(pctTick); pctTick = null; }
        if (loaderBar) {
            const pctEl = loaderBar.querySelector('.loader-pct');
            if (pctEl) pctEl.textContent = '100%';
        }
        loader.classList.add('out');
        initTypewriter();
        const onEnd = (e) => {
            if (e.propertyName !== 'opacity') return;
            loader.removeEventListener('transitionend', onEnd);
            loader.remove();
        };
        loader.addEventListener('transitionend', onEnd);
    };

    if (document.readyState === 'complete') {
        setTimeout(hideLoader, 1600);
    } else {
        window.addEventListener('load', () => setTimeout(hideLoader, 1600));
    }

    /* ═══════════════════════════════════════════
       2. NAVBAR SCROLL
    ═══════════════════════════════════════════ */
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;
    const onScroll = () => {
        const y = window.scrollY;
        navbar.classList.toggle('scrolled', y > 30);
        if (y > 80) {
            navbar.classList.toggle('shrunk', y > lastScrollY);
        } else {
            navbar.classList.remove('shrunk');
        }
        lastScrollY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ═══════════════════════════════════════════
       3. MOBILE MENU
    ═══════════════════════════════════════════ */
    const burger  = document.getElementById('nav-burger');
    const mobileNav = document.getElementById('nav-mobile');
    const closeBtn = document.getElementById('nav-close');

    const openMenu = () => {
        mobileNav.classList.add('open');
        burger.classList.add('open');
        burger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
        mobileNav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    burger.addEventListener('click', () => {
        mobileNav.classList.contains('open') ? closeMenu() : openMenu();
    });
    closeBtn.addEventListener('click', closeMenu);
    mobileNav.querySelectorAll('.nm-link').forEach(a => a.addEventListener('click', closeMenu));

    /* ═══════════════════════════════════════════
       4. HERO PARTICLE SYSTEM (canvas only, hero only)
    ═══════════════════════════════════════════ */
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let raf;
        let active = true;

        const resize = () => {
            canvas.width  = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            initParticles();
        };

        class Particle {
            constructor() { this.reset(true); }
            reset(rand = false) {
                this.x    = Math.random() * canvas.width;
                this.y    = rand ? Math.random() * canvas.height : -6;
                this.r    = Math.random() * 3.0 + 0.7;
                this.vx   = (Math.random() - 0.5) * 0.30;
                this.vy   = Math.random() * 0.24 + 0.07;
                this.base = Math.random() * 0.36 + 0.14;
                this.a    = this.base;
                this.pa   = Math.random() * 0.016 + 0.006;
                this.pd   = Math.random() > 0.5 ? 1 : -1;
                this.red  = Math.random() < 0.25;
                this.glow = this.red && this.r > 1.8;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.a += this.pa * this.pd;
                if (this.a > this.base + 0.18 || this.a < 0.02) this.pd *= -1;
                if (this.y > canvas.height + 6 || this.x < -6 || this.x > canvas.width + 6) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = this.red
                    ? `rgba(175,138,63,${this.a * 0.95})`
                    : `rgba(0,0,0,${this.a})`;
                ctx.fill();
                if (this.glow) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.r * 3.2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(175,138,63,${this.a * 0.16})`;
                    ctx.fill();
                }
            }
        }

        const initParticles = () => {
            const isMobile = canvas.width < 768;
            const raw = Math.floor((canvas.width * canvas.height) / (isMobile ? 8000 : 5000));
            const count = Math.min(Math.max(raw, isMobile ? 55 : 110), isMobile ? 90 : 240);
            particles = Array.from({ length: count }, () => new Particle());
        };

        const animate = () => {
            if (!active) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            raf = requestAnimationFrame(animate);
        };

        const heroObserver = new IntersectionObserver(([entry]) => {
            active = entry.isIntersecting;
            if (active) animate();
            else cancelAnimationFrame(raf);
        }, { threshold: 0 });

        heroObserver.observe(canvas.parentElement);

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 200);
        });

        resize();
        animate();
    }

    /* ═══════════════════════════════════════════
       5. INTERSECTION OBSERVER — SCROLL REVEAL
    ═══════════════════════════════════════════ */
    // Assign directional animation classes before observing
    (function assignRevealVariants() {
        document.querySelectorAll('.espec-card').forEach((el, i) => {
            el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
        });
        const contactInfo = document.querySelector('.contact-info');
        if (contactInfo) contactInfo.classList.add('reveal-left');
        const contactFormWrap = document.querySelector('.contact-form-wrap');
        if (contactFormWrap) contactFormWrap.classList.add('reveal-right');
        const ctaInner = document.querySelector('.cta-inner');
        if (ctaInner) ctaInner.classList.add('reveal-scale');
        // col-card, ben-card, testi-card, stat-item, process-step
        // use their own CSS keyframe animations — no generic class needed
    })();

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.classList.add('visible');
                // Add shimmer idle after entry animation finishes
                if (el.matches('.col-card, .ben-card, .testi-card')) {
                    const baseDelay = (parseFloat(getComputedStyle(el).getPropertyValue('--delay')) || 0) * 1000;
                    setTimeout(() => {
                        el.style.setProperty('--float-del', `${(Math.random() * 3).toFixed(2)}s`);
                        el.style.setProperty('--float-dur', `${(2.8 + Math.random() * 1.8).toFixed(2)}s`);
                        el.classList.add('card-floating');
                    }, baseDelay + 900);
                }
                obs.unobserve(el);
            }
        });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0.08 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    /* ═══════════════════════════════════════════
       6. COUNTER ANIMATION
    ═══════════════════════════════════════════ */
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    const animateCounter = (el) => {
        const target = parseInt(el.dataset.target, 10);
        const duration = 1800;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            el.textContent = Math.floor(easeOut(progress) * target).toLocaleString('es-MX');
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString('es-MX');
        };
        requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.counter').forEach(animateCounter);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.getElementById('estadisticas');
    if (statsSection) counterObserver.observe(statsSection);

    /* ═══════════════════════════════════════════
       7. SMOOTH SCROLL for nav links
    ═══════════════════════════════════════════ */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const id = a.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ═══════════════════════════════════════════
       8. HERO PARALLAX — works on all browsers including iOS
    ═══════════════════════════════════════════ */
    (function() {
        const heroBg = document.querySelector('.hero-bg');
        const heroEl = document.getElementById('hero');
        if (!heroBg || !heroEl) return;
        let ticking = false;
        function onParallax() {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const y = window.scrollY;
                    if (y <= heroEl.offsetHeight + 200) {
                        heroBg.style.transform = 'translateY(' + (y * 0.6) + 'px)';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }
        window.addEventListener('scroll', onParallax, { passive: true });
    })();


    /* ═══════════════════════════════════════════
       9. SECTION PARTICLES — white / gray
    ═══════════════════════════════════════════ */
    initSectionParticles();

    /* ═══════════════════════════════════════════
       10. FORM → WHATSAPP
    ═══════════════════════════════════════════ */
    const form = document.getElementById('wa-form');
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();

            const name     = document.getElementById('name')?.value.trim();
            const phone    = document.getElementById('phone')?.value.trim();
            const interest = document.getElementById('interest')?.value;
            const message  = document.getElementById('message')?.value.trim();

            if (!name || !interest) {
                const empty = !name
                    ? document.getElementById('name')
                    : document.getElementById('interest');
                empty.focus();
                empty.style.borderColor = '#DC1E1E';
                setTimeout(() => { empty.style.borderColor = ''; }, 2500);
                return;
            }

            let txt = `Hola T.P.E., soy *${name}*.\n`;
            txt += `\nMe interesa: *${interest}*`;
            if (phone)   txt += `\nMi teléfono: ${phone}`;
            if (message) txt += `\n\n${message}`;
            txt += `\n\n¿Podrían brindarme el temario y las próximas fechas disponibles? 🎯`;

            const btn = form.querySelector('.btn-form-submit');
            btn.textContent = 'Redirigiendo…';
            btn.disabled = true;

            setTimeout(() => {
                window.open(`https://wa.me/522282705442?text=${encodeURIComponent(txt)}`, '_blank');
                form.reset();
                btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> Enviar por WhatsApp`;
                btn.disabled = false;
            }, 500);
        });
    }

});

/* ═══════════════════════════════════════════
   TYPEWRITER — "Protege" hero word
═══════════════════════════════════════════ */
function initTypewriter() {
    const el = document.querySelector('.hero-red');
    if (!el) return;
    // All words agree grammatically: "que [word] Vidas de Alto Riesgo"
    const words = ['Blindan', 'Custodian', 'Resguardan', 'Protegen', 'Salvaguardan', 'Defienden'];
    let wi = 0, ci = 0, deleting = false;

    el.textContent = '';
    el.classList.add('typing');

    const tick = () => {
        const word = words[wi];
        if (!deleting) {
            ci++;
            el.textContent = word.slice(0, ci);
            if (ci === word.length) {
                deleting = true;
                setTimeout(tick, 2400);
                return;
            }
            setTimeout(tick, 75 + Math.random() * 45);
        } else {
            ci--;
            el.textContent = word.slice(0, ci);
            if (ci === 0) {
                deleting = false;
                wi = (wi + 1) % words.length;
                setTimeout(tick, 360);
                return;
            }
            setTimeout(tick, 35 + Math.random() * 20);
        }
    };
    tick();
}

/* ═══════════════════════════════════════════
   SECTION PARTICLES — white / gray sections
   Bouncing dots, very subtle, paused off-screen
═══════════════════════════════════════════ */
function initSectionParticles() {
    document.querySelectorAll('.s-white, .s-gray').forEach(section => {
        const cv = document.createElement('canvas');
        cv.className = 'section-particles';
        section.insertBefore(cv, section.firstChild);
        const ctx = cv.getContext('2d');
        let pts = [], raf = null, active = false;

        const resize = () => {
            cv.width  = section.offsetWidth;
            cv.height = section.offsetHeight;
            const n = Math.min(Math.floor((cv.width * cv.height) / 22000), 50);
            pts = Array.from({ length: Math.max(n, 22) }, () => ({
                x:   Math.random() * cv.width,
                y:   Math.random() * cv.height,
                r:   Math.random() * 2.2 + 0.6,
                vx:  (Math.random() - 0.5) * 0.22,
                vy:  (Math.random() - 0.5) * 0.22,
                a:   Math.random() * 0.22 + 0.10,
                red: Math.random() < 0.22
            }));
        };

        const loop = () => {
            if (!active) return;
            ctx.clearRect(0, 0, cv.width, cv.height);
            pts.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > cv.width)  p.vx *= -1;
                if (p.y < 0 || p.y > cv.height)  p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.red
                    ? `rgba(175,138,63,${p.a})`
                    : `rgba(0,0,0,${p.a})`;
                ctx.fill();
            });
            raf = requestAnimationFrame(loop);
        };

        new IntersectionObserver(([entry]) => {
            active = entry.isIntersecting;
            if (active) { resize(); loop(); }
            else { cancelAnimationFrame(raf); raf = null; }
        }, { threshold: 0 }).observe(section);
    });
}
