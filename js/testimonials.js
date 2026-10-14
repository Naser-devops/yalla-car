// ============================================
// Yalla Car — Testimonials Slider
// ============================================

(function () {
    'use strict';

    const slider = document.getElementById('testimonialsSlider');
    if (!slider) return;

    const track = document.getElementById('testimonialsTrack');
    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const dotsContainer = document.getElementById('sliderDots');

    const totalSlides = cards.length;
    if (totalSlides === 0) return;

    let currentIndex = 0;
    let autoplayTimer = null;
    let isPaused = false;

    // ============================================
    // 0. ✅ إضافة aria-live للتأثيرات الحيوية
    // ============================================
    track.setAttribute('aria-live', 'polite');
    track.setAttribute('aria-atomic', 'false');
    slider.setAttribute('role', 'region');
    slider.setAttribute('aria-label', 'آراء العملاء');

    // ============================================
    // 1. إنشاء النقاط
    // ============================================
    function createDots() {
        if (!dotsContainer) return;

        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', 'الشهادة رقم ' + (i + 1) + ' من ' + totalSlides);
            dot.addEventListener('click', function () {
                goToSlide(i);
            });
            dotsContainer.appendChild(dot);
        }
    }

    // ============================================
    // 2. تحديث النقاط النشطة
    // ============================================
    function updateDots() {
        if (!dotsContainer) return;
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === currentIndex);
            dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
        });
    }

    // ============================================
    // 3. الانتقال لسلايد محدد
    // ============================================
    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;

        currentIndex = index;

        const cardWidth = cards[0].offsetWidth;
        const gap = parseInt(getComputedStyle(track).gap) || 24;
        const offset = currentIndex * (cardWidth + gap);

        const isRTL = document.documentElement.dir === 'rtl';
        track.style.transform = 'translateX(' + (isRTL ? offset : -offset) + 'px)';

        updateDots();
    }

    // ============================================
    // 4. السابق / التالي
    // ============================================
    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    if (nextBtn) nextBtn.addEventListener('click', function () { nextSlide(); restartAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prevSlide(); restartAutoplay(); });

    // ============================================
    // 5. Autoplay
    // ============================================
    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(function () {
            if (!isPaused) nextSlide();
        }, 5000);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    function restartAutoplay() {
        stopAutoplay();
        startAutoplay();
    }

    // ============================================
    // 6. إيقاف عند hover / touch
    // ============================================
    slider.addEventListener('mouseenter', function () { isPaused = true; });
    slider.addEventListener('mouseleave', function () { isPaused = false; });

    slider.addEventListener('touchstart', function () { isPaused = true; }, { passive: true });
    slider.addEventListener('touchend', function () { isPaused = false; });

    // ============================================
    // 7. إيقاف عند مغادرة التاب
    // ============================================
    document.addEventListener('visibilitychange', function () {
        isPaused = document.hidden;
    });

    // ============================================
    // 8. السحب باللمس (Swipe)
    // ============================================
    let touchStartX = 0;
    let touchEndX = 0;
    const SWIPE_THRESHOLD = 50;

    track.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        const isRTL = document.documentElement.dir === 'rtl';

        if (Math.abs(diff) < SWIPE_THRESHOLD) return;

        if (isRTL) {
            if (diff < 0) prevSlide();
            else nextSlide();
        } else {
            if (diff > 0) nextSlide();
            else prevSlide();
        }

        restartAutoplay();
    }

    // ============================================
    // 9. لوحة المفاتيح
    // ============================================
    document.addEventListener('keydown', function (e) {
        const rect = slider.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) return;

        const isRTL = document.documentElement.dir === 'rtl';

        if (e.key === 'ArrowRight') {
            isRTL ? prevSlide() : nextSlide();
            restartAutoplay();
        } else if (e.key === 'ArrowLeft') {
            isRTL ? nextSlide() : prevSlide();
            restartAutoplay();
        }
    });

    // ============================================
    // 10. إعادة الحساب عند تغيير الحجم
    // ============================================
    let resizeTimeout = null;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function () {
            goToSlide(currentIndex);
        }, 150);
    });

    // ============================================
    // 11. إعادة التهيئة عند تغيير اللغة
    // ============================================
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'dir') {
                setTimeout(function () {
                    goToSlide(currentIndex);
                }, 100);
            }
        });
    });

    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['dir']
    });

    // ============================================
    // 12. التشغيل
    // ============================================
    createDots();
    goToSlide(0);
    startAutoplay();

    console.log('✅ Testimonials Slider loaded with aria-live');

})();