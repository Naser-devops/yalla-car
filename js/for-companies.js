// ============================================
// Yalla Car — JavaScript صفحة "للشركات"
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
    // 2. Smooth scroll
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            const headerHeight = 80;
            const targetPosition = target.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            history.pushState(null, '', targetId);
        });
    });


    // ============================================
    // 3. فتح أول سؤال FAQ تلقائياً
    // ============================================
    const firstFaq = document.querySelector('.fc-faq-item');
    if (firstFaq && 'IntersectionObserver' in window) {
        const faqObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.setAttribute('open', '');
                    faqObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        faqObserver.observe(firstFaq);
    }


    // ============================================
    // 4. Console
    // ============================================
    console.log('🏢 صفحة "للشركات" جاهزة');

})();