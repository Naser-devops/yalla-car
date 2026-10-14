// ============================================
// Yalla Car — JavaScript للصفحات القانونية
// ============================================

(function () {
    'use strict';

    // ============================================
    // 1. سنة الفوتر
    // ============================================
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    // ============================================
    // 2. TOC Active على Scroll
    // ============================================
    const tocLinks = document.querySelectorAll('.toc-link');
    const sections = document.querySelectorAll('.legal-section');

    function updateActiveToc() {
        const scrollPos = window.scrollY + 150;
        let currentId = '';

        sections.forEach(function (section) {
            if (section.offsetTop <= scrollPos) {
                currentId = section.id;
            }
        });

        tocLinks.forEach(function (link) {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === '#' + currentId) {
                link.classList.add('active');
            }
        });
    }

    if (sections.length > 0) {
        window.addEventListener('scroll', updateActiveToc, { passive: true });
        updateActiveToc();
    }


    // ============================================
    // 3. Smooth Scroll للـ TOC
    // ============================================
    tocLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                const offset = 100;
                const top = target.offsetTop - offset;

                window.scrollTo({
                    top: top,
                    behavior: 'smooth'
                });

                history.replaceState(null, '', targetId);
            }
        });
    });


    // ============================================
    // 4. زر العودة للأعلى
    // ============================================
    const backToTop = document.getElementById('backToTop');

    if (backToTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, { passive: true });

        backToTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

})();